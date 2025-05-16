---
title: Exploring RAG based approach for Text to SQL
kind: article
author: Tarun
created_at: 2025-05-15 00:00:00 UTC
layout: post
---
*This post is part of our Text-to-SQL series. You can find the first installment [here](https://blog.nilenso.com/blog/2025/04/30/exploring-text-to-sql/)*

In this post, we explore how Retrieval-Augmented Generation (RAG) can improve SQL query generation from natural language. 

## Why Use a RAG-Based Approach?

Retrieval‑Augmented Generation (RAG) strengthens a language model’s Text‑to‑SQL abilities by retrieving external context at inference time. This context includes far more than table schemas; it can provide column descriptions, sample rows, domain‑specific terminology etc. Because the information comes from a pre‑built index rather than a live database connection, the model can generate SQL without touching production data during inference.

## Starting with a Basic RAG Architecture

Our initial RAG pipeline is straightforward and has two steps:

### 1. Data Preparation

**Schema Representation**
To ensure the language model effectively understands database schemas, we structured schema information into clear, human-readable textual descriptions. This structured format includes  table name, each column's name, data type, constraints, and descriptive details, as well as relationships between tables.

An example of our initial schema representation looks like this:

```sql
Table: Student (db: schools)

Columns:
- "id" (type: INT) [PRIMARY KEY]
- "name" (type: VARCHAR) [NOT NULL]. Student's name
...

Relationships:
- Column "school_id" references "id" in table "school"
...
```

**Embedding Schemas with a Vector Database**

To retrieve relevant schema information efficiently, we transformed our schema descriptions into vector embeddings using the **`all-MiniLM-L6-v2`** embedding model (384-dimensional embeddings). We initially chose this lightweight model because it's fast and computationally efficient, suitable for quick iteration and testing. These embeddings are then stored in a vector database (in our case, we use pgvector) allowing us to efficiently retrieve relevant schema information later on.

(If you are unfamiliar with vector embeddings, you can read more about them [here](https://www.datacamp.com/blog/vector-embedding))

> **Why Vector Databases?**
>
> Vector databases like `pgvector` are optimized for fast semantic retrieval based on vector similarity.

### 2. Retrieval and Generation

Now as we have our data prepped up, we can use this to generate our queries. To do this, we compute the semantic similarity between the user's query and the stored schema embeddings. Based on this, we retrieve the top-k (5 in our case) most relevant schema descriptions. These descriptions are then passed along with some basic prompt to the LLM to generate the SQL query.

This straightforward approach allowed us to validate the core functionality quickly. However, as we began testing this initial setup more extensively, several notable limitations became apparent.

![RAG](/images/blog/screenshot-2025-04-25-at-2.15.31 pm.png)

**Issues with the initial RAG setup**

One major issue was the imprecision of similarity scores, which occasionally resulted in irrelevant schema contexts being ranked higher than the more relevant ones. We also encountered model hallucinations, where the generated SQL queries included nonexistent columns or tables. Even when provided with accurate schema context, the model's adherence to it was inconsistent, causing occasional inaccuracies in query generation.

This initial baseline performance on benchmark datasets was:

\| Architecture | Bird (dev) Accuracy
(~1500 questions) | Spider Accuracy
(first 500 questions) |
| --- | --- | --- |
| Basic RAG (Gemini-2-0) | 57.1% |  |

- - -

## Iterative Improvements

To tackle these issues, we introduced a series of targeted improvements.

*To keep turnaround time short, we didn’t run the full benchmark after every tweak.*

\*Instead, we worked with a subset of ~60 questions **\*\*from the BirdBench dev \*\***set that let us iterate faster. Accuracy percent for this set with our initial baseline is 51.6%.*

### 1. Fixing the Low-Hanging Fruits

**Prompt Engineering**

Initially, the model sometimes generated queries with incorrect or hallucinated columns. To mitigate this, we provided explicit instructions in the prompt:

> "Use only columns and tables explicitly mentioned in the provided schema."

This straightforward directive brought column and table name hallucinations down to zero. 

Additionally, we addressed smaller inconsistencies like the model occasionally wrapping results within `sql` code blocks or providing unnecessary explanations. We refined the prompt further to ensure the model returned only valid SQL statements using the correct schema elements.

**Post processing**

Even after explicitly stating not to wrap the result in `sql` code block, the model sometimes returned it in sql block. Instead of further experimenting with the prompt, we added a tiny cleanup step to remove these codeblocks. 

We found these issues more with `gpt-4o` and `claude-3-5-sonnet` models. `gemini-2.0-flash`  had fewer cases of name hallucinations. 

Both of these fixes improved the results of out test set by around 2% (with gemini-2-0-flash).

- - -

### 2. Refining Our Schema Embeddings

During testing we noticed that tables that might not be relevant to the query were sometimes floating at top of our cosine similarity scores. On investigating this further, we realized that there were two issues:

* **Too much text per table**

    We were packing every column name, note and constraint into one large text blob. The real meaning of each table got lost in the noise.
    
* **A small embedding model**

    We also hypothesized that the lightweight embedding model (`all‑miniLM‑L6‑v2`, 384 dimensions) we used might not have enough “space” to store the fine‑grained differences between tables.
    

To address these, we refined our schema embedding process in two key ways.

1. Short summaries

   We introduced a **schema summarization** step. Using an LLM, we generated concise summaries for each table schema. These focused summaries cuts down the noise resulting in better similarity scores
2. A larger embedding model

   We **upgraded our embedding model** to a model with [higher dimensions](https://huggingface.co/sentence-transformers/all-mpnet-base-v2)(all-mpnet-base-v2, 768 dimensions), enabling it to capture more information.

With just those two fixes, we had relevant tables getting better similarity scores.

```sql
# Natural Language question:
# “What is the Percent (%) Eligible Free (K‑12) in the school
#  administered by an administrator whose first name is Alusine?
#  List the district code of the school.”

# Required tables in generated query: frpm, schools

# ── Similarity scores of formatted textual schema embeddings ──────────────────
# Model: all‑miniLM‑L6‑v2  (384 d)
Table                            | Similarity score
---------------------------------------------------
satscores                        |  0.345   ← irrelevant table edges ahead
schools                          |  0.344
frpm (free or reduced price meal)|  0.315

# Model: all‑mpnet‑base‑v2 (768 d)
Table                            | Similarity score
---------------------------------------------------
satscores                        | 0.388
schools                          | 0.359
frpm                             | 0.354

# ── Similarity scores of LLM‑generated summaries embeddings ────────────────────────
# Model: all‑mpnet‑base‑v2 (768 d)
Table                            | Similarity score
---------------------------------------------------
frpm                             | 0.504   ← relevant table has higher score
schools                          | 0.446
satscores                        | 0.388
```

*Note that we still use the formatted textual representation as context to the LLM. Summaries are only used to filter out the relevant tables.*

- - -

### 3. Enhancing Context with Sample Values

Even with improved embeddings, subtle semantic mismatches remained problematic. Consider the following question

```sql
-- Question: How many superheroes have gold hair color 

-- BEFORE (no sample value)
SELECT count(*) FROM superhero
WHERE hair_color = 'gold';
```

Though this query seems to be correct, it won’t return correct results as the column `hair_color` stores values in title-case (`Gold`) but the as the user query had the color value in lowercase, the query that got generated also had `hair_color = 'gold'`  

To solve this issue, while data prepping, we enrich schema’s textual representation with actual sample data values.

```sql
...
Columns:
- hair_color (type: VARCHAR). Hair color. Sample values: Brown, Black, Gold 
```

Including these values helped the model to resolve these low level mismatches (like casing and phrasing differences) between queries and underlying data. 

```sql
-- AFTER (sample values: Brown, Black, Gold)
SELECT count(*) FROM superhero
WHERE hair_color = 'Gold';
```

This seemingly minor enhancement improved overall accuracy by approximately **3-4%**, highlighting the importance of detailed contextual data in a RAG setup.

- - -

### 4. Self correction mechanism

Evaluating the queries generated so far showed that even strong first‑pass queries still hid subtle table or join errors, so we introduced an llm based self correction step. 

In this step, we pass the generated SQL query back to the LLM, prompting it to evaluate whether the query truly satisfies the user's intent. If the LLM detects a mismatch, it suggests specific changes. We then apply those changes to produce a refined query.

To further ensure correctness, we run the final query through `sqlfluff`, which helps catch and fix any remaining syntactic issues. This feedback step noticeably reduced the overall number of queries that were failing due to syntax issues.

- - -

### 5. Adding few shots

Large language models learn fast by example as shown in the paper [Language Models are Few-Shot Learners](https://arxiv.org/pdf/2005.14165).  By adding a few relevant questions and SQL pairs to the context that we pass to the LLM, we might be able to improve the overall accuracy of the results. So here’s how we added few-shots generation to our RAG pipeline:

1. **Generate Question-SQL pairs**

   For every database that the user can query, we ask LLM to invent `n` realistic question and SQL pairs. 

   ```sql
   Generate exactly {num_queries} realistic business questions and their corresponding SQL queries.

   Instructions for generation:
   1. **Strict Schema Adherence:** Generate questions and SQL queries that ONLY use the tables and columns provided in the schema description above. DO NOT invent tables or columns.
   2. **Understand the Database:** Carefully analyze the tables, their relationships, and the columns with their types and meanings to construct interesting examples.
   3. **Variety:** Ensure the {num_queries} pairs cover a variety of query types and challenging complexity levels suitable for real-world use cases.
   4. **Required Query Types:** Include an appropriate mix of:
      • Simple SQL queries without JOINs
      • SQL queries with aggregates (COUNT, SUM, AVG, MAX, MIN)
      • Simple SQL queries with JOINs
      • Complex SQL queries with nested JOINs
      • Queries with subqueries, CTEs, window functions, LIMIT, OFFSET where appropriate
   ```
2. **Embed and store questions**

   We store the question-sql pairs in our db. Along with these, we store vector embedding of the question text as well. This helps us in doing the similarity search later on.
3. **Retrieve similar examples at inference time**

   When a user asks a question, we embed it, find the cosine similarities against the stored embeddings, select the top-3 matches, and append those example pairs to the prompt.

On our test dataset, this extra context lifted accuracy by about 7%.

> **Scale note:** The databases that we are running this against have a limited number of tables. In a scenario where we have hundreds of tables in a database, it may be impractical to pass the full schema to the LLM and pre-generate only 20 examples. A workaround is to create these examples on-the-fly. To do this, we first run the usual RAG step to fetch the top-k relevant tables for the user question, then ask the LLM to generate a small set of example questions and SQL *only for that subset* of tables, and finally include those examples in the prompt. A similar approach was used in [Chase-SQL](https://arxiv.org/pdf/2410.01943) for synthetic example generation

### 6. Divide-and-Conquer Example Generation

With the success of few-shot priming, we explored a complementary idea: let the LLM break a complex question into simpler sub-questions**,** generate answers for those and use these question-SQL pairs along with the original context and user’s question to generate the SQL**.** *This “divide-and-conquer” recipe follows the candidate-generation strategy described in [Chase-SQL](https://arxiv.org/pdf/2410.01943).*

> Although it isn’t strictly a RAG technique, the idea(sparked by the Chase-SQL paper) grew naturally out of our few-shot experiments and hence we went ahead and added it into the rest of our Text-to-SQL pipeline.

**How it works and fits into our pipeline**

* **Divide** - We ask the LLM to divide the user’s questions into sub-questions that can be answered individually
* **Use sub-queries as examples** - We pass all these sub-questions along with their answers as examples to the prompt along with table schema and user’s question.
* **Candidate selection** - We ask LLM to be the judge and pick the most relevant answer between the one generated by our previous few-shots pipeline and the divide and conquer flow

Against our original test set the improvement was barely noticeable. Unsurprising, since few of those questions truly needed decomposition. To probe Chase-SQL’s claim that the method shines on complex queries that need decomposition, we built a new set of 50 questions with higher number of moderate and complex queries. On that tougher set accuracy climbed by about 8%.

## The Final RAG Pipeline

This is how our final RAG based solution looks with all the suggested changes:

![Refined Rag](/images/blog/screenshot-2025-05-15-at-3.35.03 pm.png)

- - -

## Results

We ran both baseline and our solution through \~1500 questions of Bird bench dev dataset and \~500 questions from spider dataset and here are the results:

|     | Bird (dev) | Spider |
| --- | ---------- | ------ |

\| Basic RAG architecture
(Gemini-2-0) | 57.1 |  |
| Refined RAG + sample values + self-correction + few-shot + divide-and-conquer
(Gemini-2-0) | 61.8 | 88.9 |

## Next Steps

There are still various techniques that we could try on this pipeline like adding a [Query plan CoT](https://arxiv.org/pdf/2410.01943), or using a more performant [m-schema](https://arxiv.org/pdf/2411.08599) representation. We could also have used smarter candidate selector and query fixer that run the generated query and analyze the result but we didn’t dwelve into this intentionally as in production-grade scenarios, running queries directly against a live database at inference time may not always be practical or desirable. With this in mind, our approach ensures that the connection to the actual database occurs only during the data preparation phase and not during query generation. 

Next up: a deep-dive into agentic flows for Text-to-SQL. Stay tuned

## Referenced Papers

* [Chase-SQL: Multi-Path Reasoning and Preference Optimized Candidate Selection in Text-to-SQL](https://arxiv.org/pdf/2410.01943)
* [A multi-generator ensemble framework for text-to-sql](https://arxiv.org/pdf/2411.08599)
* [Language models are Few-Shot learners](https://arxiv.org/pdf/2005.14165)
