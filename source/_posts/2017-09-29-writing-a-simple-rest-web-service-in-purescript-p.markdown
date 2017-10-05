---
title: "Writing a Simple REST Web Service in Purescript - Part 1"
kind: article
created_at: 2017-09-29 00:00:00 UTC
author: Abhinav Sarkar
layout: post
---
<div class="ert">
23 minute read
</div>
<p>At <a href="https://nilenso.com" target="_blank" rel="noopener">Nilenso</a>, we’ve been working with a client who has chosen <a href="http://purescript.org" target="_blank" rel="noopener">Purescript</a> as their primary programming language. Since I couldn’t find any canonical documentation on writing a web service in PureScript, I thought I’d jot down the approach that we took.</p>
<p>The aim of this two-part tutorial is to create a simple JSON <a href="https://en.wikipedia.org/wiki/REST" target="_blank" rel="noopener">REST</a> web service written in Purescript, to run on a node.js server. This assumes that you have basic proficiency with Purescript. We have the following requirements:</p>
<ol type="1">
<li>persisting users into a Postgres database.</li>
<li>API endpoints for creating, updating, getting, listing and deleting users.</li>
<li>validation of API requests.</li>
<li>reading the server and database configs from environment variables.</li>
<li>logging HTTP requests and debugging info.</li>
</ol>
<p>In this part we’ll work on setting up the project and on the first two requirements. In the <a href="https://abhinavsarkar.net/posts/ps-simple-rest-service-2/">next</a> part we’ll work on the rest of the requirements.</p>
<!--more-->
<nav id="toc" class="right-toc"><h3>Contents</h3><ol><li><a href="#setting-up">Setting Up</a></li><li><a href="#types-first">Types First</a></li><li><a href="#persisting-it">Persisting It</a></li><li><a href="#serving-it">Serving It</a><ol><li><a href="#getting-a-user">Getting a User</a></li><li><a href="#deleting-a-user">Deleting a User</a></li><li><a href="#creating-a-user">Creating a User</a></li><li><a href="#updating-a-user">Updating a User</a></li><li><a href="#listing-all-users">Listing all Users</a></li></ol></li><li><a href="#conclusion">Conclusion</a></li></ol></nav>
<h2 id="setting-up">Setting Up<a href="#setting-up" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>We start with installing Purescript and the required tools. This assumes that we have <a href="https://nodejs.org" target="_blank" rel="noopener">node</a> and <a href="https://www.npmjs.com" target="_blank" rel="noopener">npm</a> installed on our machine.</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="fu">mkdir</span> -p ~/.local/
$ <span class="ex">npm</span> install -g purescript pulp bower --prefix ~/.local/</code></pre></div>
<p><a href="https://github.com/purescript-contrib/pulp" target="_blank" rel="noopener">Pulp</a> is a build tool for Purescript projects and <a href="http://bower.io" target="_blank" rel="noopener">bower</a> is a package manager used to get Purescript libraries. We’ll have to add <code>~/.local/bin</code> in our <code>$PATH</code> (if it is not already added) to access the binaries installed.</p>
<p>Let’s create a directory for our project and make Pulp initialize it:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="fu">mkdir</span> ps-simple-rest-service
$ <span class="bu">cd</span> ps-simple-rest-service
$ <span class="ex">pulp</span> init
$ <span class="fu">ls</span>
<span class="ex">bower.json</span>  bower_components  src  test
$ <span class="fu">cat</span> bower.json
<span class="kw">{</span>
  <span class="st">&quot;name&quot;</span>: <span class="st">&quot;ps-simple-rest-service&quot;</span>,
  <span class="st">&quot;ignore&quot;</span>:<span class="bu"> [</span>
    <span class="st">&quot;**/.*&quot;</span>,
    <span class="st">&quot;node_modules&quot;</span>,
    <span class="st">&quot;bower_components&quot;</span>,
    <span class="st">&quot;output&quot;</span>
  ],
  <span class="st">&quot;dependencies&quot;</span>: {
    <span class="st">&quot;purescript-prelude&quot;</span>: <span class="st">&quot;^3.1.0&quot;</span>,
    <span class="st">&quot;purescript-console&quot;</span>: <span class="st">&quot;^3.0.0&quot;</span>
  },
  <span class="st">&quot;devDependencies&quot;</span>: {
    <span class="st">&quot;purescript-psci-support&quot;</span>: <span class="st">&quot;^3.0.0&quot;</span>
  }
}
$ ls bower_components
purescript-console  purescript-eff  purescript-prelude purescript-psci-support</code></pre></div>
<p>Pulp creates the basic project structure for us. <code>src</code> directory will contain the source while the <code>test</code> directory will contain the tests. <code>bower.json</code> contains the Purescript libraries as dependencies which are downloaded and installed in the <code>bower_components</code> directory.</p>
<h2 id="types-first">Types First<a href="#types-first" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>First, we create the types needed in <code>src/SimpleService/Types.purs</code>:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">SimpleService.Types</span> <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Data.Foreign.Class</span> (class <span class="dt">Decode</span>, class <span class="dt">Encode</span>)
<span class="kw">import </span><span class="dt">Data.Foreign.Generic</span> (defaultOptions, genericDecode, genericEncode)
<span class="kw">import </span><span class="dt">Data.Generic.Rep</span> (class <span class="dt">Generic</span>)
<span class="kw">import </span><span class="dt">Data.Generic.Rep.Show</span> (genericShow)

<span class="kw">type</span> <span class="dt">UserID</span> <span class="fu">=</span> <span class="dt">Int</span>

<span class="kw">newtype</span> <span class="dt">User</span> <span class="fu">=</span> <span class="dt">User</span>
  {<span class="ot"> id   ::</span> <span class="dt">UserID</span>
  ,<span class="ot"> name ::</span> <span class="dt">String</span>
  }

derive <span class="kw">instance</span><span class="ot"> genericUser ::</span> <span class="dt">Generic</span> <span class="dt">User</span> _

<span class="kw">instance</span><span class="ot"> showUser ::</span> <span class="dt">Show</span> <span class="dt">User</span> <span class="kw">where</span>
  show <span class="fu">=</span> genericShow

<span class="kw">instance</span><span class="ot"> decodeUser ::</span> <span class="dt">Decode</span> <span class="dt">User</span> <span class="kw">where</span>
  decode <span class="fu">=</span> genericDecode <span class="fu">$</span> defaultOptions { unwrapSingleConstructors <span class="fu">=</span> true }

<span class="kw">instance</span><span class="ot"> encodeUser ::</span> <span class="dt">Encode</span> <span class="dt">User</span> <span class="kw">where</span>
  encode <span class="fu">=</span> genericEncode <span class="fu">$</span> defaultOptions { unwrapSingleConstructors <span class="fu">=</span> true }</code></pre></div>
<p>We are using the generic support for Purescript types from the <a href="https://pursuit.purescript.org/packages/purescript-generics-rep" target="_blank" rel="noopener"><code>purescript-generics-rep</code></a> and <a href="https://pursuit.purescript.org/packages/purescript-foreign-generic" target="_blank" rel="noopener"><code>purescript-foreign-generic</code></a> libraries to encode and decode the <code>User</code> type to JSON. We install the library by running the following command:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">bower</span> install purescript-foreign-generic --save</code></pre></div>
<p>Now we can load up the module in the Purescript REPL and try out the JSON conversion features:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="fu">$</span> pulp repl
<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">SimpleService.Types</span>
<span class="fu">&gt;</span> user <span class="fu">=</span> <span class="dt">User</span> { id<span class="fu">:</span> <span class="dv">1</span>, name<span class="fu">:</span> <span class="st">&quot;Abhinav&quot;</span>}
<span class="fu">&gt;</span> user
(<span class="dt">User</span> { id<span class="fu">:</span> <span class="dv">1</span>, name<span class="fu">:</span> <span class="st">&quot;Abhinav&quot;</span> })

<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">Data.Foreign.Generic</span>
<span class="fu">&gt;</span> userJSON <span class="fu">=</span> encodeJSON user
<span class="fu">&gt;</span> userJSON
<span class="st">&quot;{\&quot;name\&quot;:\&quot;Abhinav\&quot;,\&quot;id\&quot;:1}&quot;</span>

<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">Data.Foreign</span>
<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">Control.Monad.Except.Trans</span>
<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">Data.Identity</span>
<span class="fu">&gt;</span> dUser <span class="fu">=</span> decodeJSON<span class="ot"> userJSON ::</span> <span class="dt">F</span> <span class="dt">User</span>
<span class="fu">&gt;</span> eUser <span class="fu">=</span> <span class="kw">let</span> (<span class="dt">Identity</span> eUser) <span class="fu">=</span> runExceptT <span class="fu">$</span> dUser <span class="kw">in</span> eUser
<span class="fu">&gt;</span> eUser
(<span class="dt">Right</span> (<span class="dt">User</span> { id<span class="fu">:</span> <span class="dv">1</span>, name<span class="fu">:</span> <span class="st">&quot;Abhinav&quot;</span> }))</code></pre></div>
<p>We use <code>encodeJSON</code> and <code>decodeJSON</code> functions from the <a href="https://pursuit.purescript.org/packages/purescript-foreign-generic/4.3.0/docs/Data.Foreign.Generic" target="_blank" rel="noopener"><code>Data.Foreign.Generic</code></a> module to encode and decode the <code>User</code> instance to JSON. The return type of <code>decodeJSON</code> is a bit complicated as it needs to return the parsing errors too. In this case, the decoding returns no errors and we get back a <code>Right</code> with the correctly parsed <code>User</code> instance.</p>
<h2 id="persisting-it">Persisting It<a href="#persisting-it" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>Next, we add the support for saving a <code>User</code> instance to a Postgres DB. First, we install the required libraries using bower and npm: <a href="https://github.com/brianc/node-postgres" target="_blank" rel="noopener"><code>pg</code></a> for Javascript bindings to call Postgres, <a href="https://pursuit.purescript.org/packages/purescript-aff" target="_blank" rel="noopener"><code>purescript-aff</code></a> for asynchronous processing and <a href="https://pursuit.purescript.org/packages/purescript-postgresql-client" target="_blank" rel="noopener"><code>purescript-postgresql-client</code></a> for Purescript wrapper over <code>pg</code>:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">npm</span> init -y
$ <span class="ex">npm</span> install pg@6.4.0 --save
$ <span class="ex">bower</span> install purescript-aff --save
$ <span class="ex">bower</span> install purescript-postgresql-client --save</code></pre></div>
<p>Before writing the code, we create the database and the <code>users</code> table using the command-line Postgres client:</p>
<pre><code>$ psql postgres
psql (9.5.4)
Type &quot;help&quot; for help.

postgres=# create database simple_service;
CREATE DATABASE
postgres=# \c simple_service
You are now connected to database &quot;simple_service&quot; as user &quot;abhinav&quot;.
simple_service=# create table users (id int primary key, name varchar(100) not null);
CREATE TABLE
simple_service=# \d users
            Table &quot;public.users&quot;
 Column |          Type          | Modifiers
--------+------------------------+-----------
 id     | integer                | not null
 name   | character varying(100) | not null
Indexes:
    &quot;users_pkey&quot; PRIMARY KEY, btree (id)</code></pre>
<p>Now we add support for converting a <code>User</code> instance to-and-from an SQL row by adding the following code in the <code>src/SimpleService/Types.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">import </span><span class="dt">Data.Array</span> <span class="kw">as</span> <span class="dt">Array</span>
<span class="kw">import </span><span class="dt">Data.Either</span> (<span class="dt">Either</span>(..))
<span class="kw">import </span><span class="dt">Database.PostgreSQL</span> (class <span class="dt">FromSQLRow</span>, class <span class="dt">ToSQLRow</span>, fromSQLValue, toSQLValue)

<span class="co">-- code written earlier</span>

<span class="kw">instance</span><span class="ot"> userFromSQLRow ::</span> <span class="dt">FromSQLRow</span> <span class="dt">User</span> <span class="kw">where</span>
  fromSQLRow [id, name] <span class="fu">=</span>
    <span class="dt">User</span> <span class="fu">&lt;$&gt;</span> ({ id<span class="fu">:</span> _, name<span class="fu">:</span> _} <span class="fu">&lt;$&gt;</span> fromSQLValue id <span class="fu">&lt;*&gt;</span> fromSQLValue name)

  fromSQLRow xs <span class="fu">=</span> <span class="dt">Left</span> <span class="fu">$</span> <span class="st">&quot;Row has &quot;</span> <span class="fu">&lt;&gt;</span> show n <span class="fu">&lt;&gt;</span> <span class="st">&quot; fields, expecting 2.&quot;</span>
    <span class="kw">where</span> n <span class="fu">=</span> Array.length xs

<span class="kw">instance</span><span class="ot"> userToSQLRow ::</span> <span class="dt">ToSQLRow</span> <span class="dt">User</span> <span class="kw">where</span>
  toSQLRow (<span class="dt">User</span> {id, name}) <span class="fu">=</span> [toSQLValue id, toSQLValue name]</code></pre></div>
<p>We can try out the persistence support in the REPL:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="fu">$</span> pulp repl
<span class="dt">PSCi</span>, version <span class="fl">0.11</span><span class="fu">.</span><span class="dv">6</span>
<span class="dt">Type</span> <span class="fu">:?</span> for help

<span class="kw">import </span><span class="dt">Prelude</span>
<span class="fu">&gt;</span>
<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">SimpleService.Types</span>
<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">Control.Monad.Aff</span> (launchAff, liftEff')
<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span>
<span class="fu">&gt;</span> user <span class="fu">=</span> <span class="dt">User</span> { id<span class="fu">:</span> <span class="dv">1</span>, name<span class="fu">:</span> <span class="st">&quot;Abhinav&quot;</span> }
<span class="fu">&gt;</span> databaseConfig <span class="fu">=</span> {user<span class="fu">:</span> <span class="st">&quot;abhinav&quot;</span>, password<span class="fu">:</span> <span class="st">&quot;&quot;</span>, host<span class="fu">:</span> <span class="st">&quot;localhost&quot;</span>, port<span class="fu">:</span> <span class="dv">5432</span>, database<span class="fu">:</span> <span class="st">&quot;simple_service&quot;</span>, max<span class="fu">:</span> <span class="dv">10</span>, idleTimeoutMillis<span class="fu">:</span> <span class="dv">1000</span>}

<span class="fu">&gt;</span> <span class="fu">:</span>paste
… void <span class="fu">$</span> launchAff <span class="kw">do</span>
…   pool <span class="ot">&lt;-</span> PG.newPool databaseConfig
…   PG.withConnection pool <span class="fu">$</span> \conn <span class="ot">-&gt;</span> <span class="kw">do</span>
…     PG.execute conn (<span class="dt">PG.Query</span> <span class="st">&quot;insert into users (id, name) values ($1, $2)&quot;</span>) user
…
unit

<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">Data.Foldable</span> (for_)
<span class="fu">&gt;</span> <span class="kw">import </span><span class="dt">Control.Monad.Eff.Console</span> (logShow)
<span class="fu">&gt;</span> <span class="fu">:</span>paste
… void <span class="fu">$</span> launchAff <span class="kw">do</span>
…   pool <span class="ot">&lt;-</span> PG.newPool databaseConfig
…   PG.withConnection pool <span class="fu">$</span> \conn <span class="ot">-&gt;</span> <span class="kw">do</span>
…<span class="ot">     users ::</span> <span class="dt">Array</span> <span class="dt">User</span> <span class="ot">&lt;-</span> PG.query conn (<span class="dt">PG.Query</span> <span class="st">&quot;select id, name from users where id = $1&quot;</span>) (<span class="dt">PG.Row1</span> <span class="dv">1</span>)
…     liftEff' <span class="fu">$</span> void <span class="fu">$</span> for_ users logShow
…
unit
(<span class="dt">User</span> { id<span class="fu">:</span> <span class="dv">1</span>, name<span class="fu">:</span> <span class="st">&quot;Abhinav&quot;</span> })</code></pre></div>
<p>We create the <code>databaseConfig</code> record with the configs needed to connect to the database. Using the recond, we create a new Postgres connection pool (<code>PG.newPool</code>) and get a connection from it (<code>PG.withConnection</code>). We call <code>PG.execute</code> with the connection, the SQL insert query for the users table and the <code>User</code> instance, to insert the user into the table. All of this is done inside <a href="https://pursuit.purescript.org/packages/purescript-aff/3.1.0/docs/Control.Monad.Aff#v:launchAff" target="_blank" rel="noopener"><code>launchAff</code></a> which takes care of sequencing the callbacks correctly to make the asynchronous code look synchronous.</p>
<p>Similarly, in the second part, we query the table using <code>PG.query</code> function by calling it with a connection, the SQL select query and the <code>User</code> ID as the query parameter. It returns an <code>Array</code> of users which we log to the console using the <code>logShow</code> function.</p>
<p>We use this experiment to write the persistence related code in the <code>src/SimpleService/Persistence.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">SimpleService.Persistence</span>
  ( insertUser
  , findUser
  , updateUser
  , deleteUser
  , listUsers
  ) <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Control.Monad.Aff</span> (<span class="dt">Aff</span>)
<span class="kw">import </span><span class="dt">Data.Array</span> <span class="kw">as</span> <span class="dt">Array</span>
<span class="kw">import </span><span class="dt">Data.Maybe</span> (<span class="dt">Maybe</span>)
<span class="kw">import </span><span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span>
<span class="kw">import </span><span class="dt">SimpleService.Types</span> (<span class="dt">User</span>(..), <span class="dt">UserID</span>)

<span class="ot">insertUserQuery ::</span> <span class="dt">String</span>
insertUserQuery <span class="fu">=</span> <span class="st">&quot;insert into users (id, name) values ($1, $2)&quot;</span>

<span class="ot">findUserQuery ::</span> <span class="dt">String</span>
findUserQuery <span class="fu">=</span> <span class="st">&quot;select id, name from users where id = $1&quot;</span>

<span class="ot">updateUserQuery ::</span> <span class="dt">String</span>
updateUserQuery <span class="fu">=</span> <span class="st">&quot;update users set name = $1 where id = $2&quot;</span>

<span class="ot">deleteUserQuery ::</span> <span class="dt">String</span>
deleteUserQuery <span class="fu">=</span> <span class="st">&quot;delete from users where id = $1&quot;</span>

<span class="ot">listUsersQuery ::</span> <span class="dt">String</span>
listUsersQuery <span class="fu">=</span> <span class="st">&quot;select id, name from users&quot;</span>

<span class="ot">insertUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Connection</span> <span class="ot">-&gt;</span> <span class="dt">User</span>
           <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff) <span class="dt">Unit</span>
insertUser conn user <span class="fu">=</span>
  PG.execute conn (<span class="dt">PG.Query</span> insertUserQuery) user

<span class="ot">findUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Connection</span> <span class="ot">-&gt;</span> <span class="dt">UserID</span>
         <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff) (<span class="dt">Maybe</span> <span class="dt">User</span>)
findUser conn userID <span class="fu">=</span>
  map Array.head <span class="fu">$</span> PG.query conn (<span class="dt">PG.Query</span> findUserQuery) (<span class="dt">PG.Row1</span> userID)

<span class="ot">updateUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Connection</span> <span class="ot">-&gt;</span> <span class="dt">User</span>
           <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff) <span class="dt">Unit</span>
updateUser conn (<span class="dt">User</span> {id, name}) <span class="fu">=</span>
  PG.execute conn (<span class="dt">PG.Query</span> updateUserQuery) (<span class="dt">PG.Row2</span> name id)

<span class="ot">deleteUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Connection</span> <span class="ot">-&gt;</span> <span class="dt">UserID</span>
           <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff) <span class="dt">Unit</span>
deleteUser conn userID <span class="fu">=</span>
  PG.execute conn (<span class="dt">PG.Query</span> deleteUserQuery) (<span class="dt">PG.Row1</span> userID)

<span class="ot">listUsers ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Connection</span>
          <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff) (<span class="dt">Array</span> <span class="dt">User</span>)
listUsers conn <span class="fu">=</span>
  PG.query conn (<span class="dt">PG.Query</span> listUsersQuery) <span class="dt">PG.Row0</span></code></pre></div>
<h2 id="serving-it">Serving It<a href="#serving-it" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>We can now write a simple HTTP API over the persistence layer using <a href="https://expressjs.com" target="_blank" rel="noopener">Express</a> to provide CRUD functionality for users. Let’s install Express and <a href="https://pursuit.purescript.org/packages/purescript-express" target="_blank" rel="noopener">purescript-express</a>, the Purescript wrapper over it:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">npm</span> install express --save
$ <span class="ex">bower</span> install purescript-express --save</code></pre></div>
<h3 id="getting-a-user">Getting a User<a href="#getting-a-user" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h3>
<p>We do this top-down. First, we change <code>src/Main.purs</code> to run the HTTP server by providing the server port and database configuration:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">Main</span> <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Control.Monad.Eff</span> (<span class="dt">Eff</span>)
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Console</span> (<span class="dt">CONSOLE</span>)
<span class="kw">import </span><span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span>
<span class="kw">import </span><span class="dt">Node.Express.Types</span> (<span class="dt">EXPRESS</span>)
<span class="kw">import </span><span class="dt">SimpleService.Server</span> (runServer)

<span class="ot">main ::</span> forall eff<span class="fu">.</span> <span class="dt">Eff</span> (<span class="ot"> console ::</span> <span class="dt">CONSOLE</span>
                        ,<span class="ot"> express ::</span> <span class="dt">EXPRESS</span>
                        ,<span class="ot"> postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span>
                        <span class="fu">|</span> eff) <span class="dt">Unit</span>
main <span class="fu">=</span> runServer port databaseConfig
  <span class="kw">where</span>
    port <span class="fu">=</span> <span class="dv">4000</span>
    databaseConfig <span class="fu">=</span> { user<span class="fu">:</span> <span class="st">&quot;abhinav&quot;</span>
                     , password<span class="fu">:</span> <span class="st">&quot;&quot;</span>
                     , host<span class="fu">:</span> <span class="st">&quot;localhost&quot;</span>
                     , port<span class="fu">:</span> <span class="dv">5432</span>
                     , database<span class="fu">:</span> <span class="st">&quot;simple_service&quot;</span>
                     , max<span class="fu">:</span> <span class="dv">10</span>
                     , idleTimeoutMillis<span class="fu">:</span> <span class="dv">1000</span>
                     }</code></pre></div>
<p>Next, we wire up the server routes to the handlers in <code>src/SimpleService/Server.purs</code>:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">SimpleService.Server</span> (runServer) <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Control.Monad.Aff</span> (runAff)
<span class="kw">import </span><span class="dt">Control.Monad.Eff</span> (<span class="dt">Eff</span>)
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Class</span> (liftEff)
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Console</span> (<span class="dt">CONSOLE</span>, log, logShow)
<span class="kw">import </span><span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span>
<span class="kw">import </span><span class="dt">Node.Express.App</span> (<span class="dt">App</span>, get, listenHttp)
<span class="kw">import </span><span class="dt">Node.Express.Types</span> (<span class="dt">EXPRESS</span>)
<span class="kw">import </span><span class="dt">SimpleService.Handler</span> (getUser)

<span class="ot">app ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
app pool <span class="fu">=</span> <span class="kw">do</span>
  get <span class="st">&quot;/v1/user/:id&quot;</span> <span class="fu">$</span> getUser pool

<span class="ot">runServer ::</span> forall eff<span class="fu">.</span>
             <span class="dt">Int</span>
          <span class="ot">-&gt;</span> <span class="dt">PG.PoolConfiguration</span>
          <span class="ot">-&gt;</span> <span class="dt">Eff</span> (<span class="ot"> express ::</span> <span class="dt">EXPRESS</span>
                 ,<span class="ot"> postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span>
                 ,<span class="ot"> console ::</span> <span class="dt">CONSOLE</span>
                 <span class="fu">|</span> eff ) <span class="dt">Unit</span>
runServer port databaseConfig <span class="fu">=</span>  void <span class="fu">$</span> runAff logShow pure <span class="kw">do</span>
  pool <span class="ot">&lt;-</span> PG.newPool databaseConfig
  <span class="kw">let</span> app' <span class="fu">=</span> app pool
  void <span class="fu">$</span> liftEff <span class="fu">$</span> listenHttp app' port \_ <span class="ot">-&gt;</span> log <span class="fu">$</span> <span class="st">&quot;Server listening on :&quot;</span> <span class="fu">&lt;&gt;</span> show port</code></pre></div>
<p><code>runServer</code> creates a PostgreSQL connection pool and passes it to the <code>app</code> function which creates the Express application, which in turn, binds it to the handler <code>getUser</code>. Then it launches the HTTP server by calling <code>listenHttp</code>.</p>
<p>Finally, we write the actual <code>getUser</code> handler in <code>src/SimpleService/Handler.purs</code>:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">SimpleService.Handler</span> <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Control.Monad.Aff.Class</span> (liftAff)
<span class="kw">import </span><span class="dt">Data.Foreign.Class</span> (encode)
<span class="kw">import </span><span class="dt">Data.Int</span> (fromString)
<span class="kw">import </span><span class="dt">Data.Maybe</span> (<span class="dt">Maybe</span>(..))
<span class="kw">import </span><span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span>
<span class="kw">import </span><span class="dt">Node.Express.Handler</span> (<span class="dt">Handler</span>)
<span class="kw">import </span><span class="dt">Node.Express.Request</span> (getRouteParam)
<span class="kw">import </span><span class="dt">Node.Express.Response</span> (end, sendJson, setStatus)
<span class="kw">import </span><span class="dt">SimpleService.Persistence</span> <span class="kw">as</span> <span class="dt">P</span>

<span class="ot">getUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
getUser pool <span class="fu">=</span> getRouteParam <span class="st">&quot;id&quot;</span> <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
  <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { error<span class="fu">:</span> <span class="st">&quot;User ID is required&quot;</span> }
  <span class="dt">Just</span> sUserId <span class="ot">-&gt;</span> <span class="kw">case</span> fromString sUserId <span class="kw">of</span>
    <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { error<span class="fu">:</span> <span class="st">&quot;User ID must be an integer: &quot;</span> <span class="fu">&lt;&gt;</span> sUserId }
    <span class="dt">Just</span> userId <span class="ot">-&gt;</span> liftAff (PG.withConnection pool <span class="fu">$</span> flip P.findUser userId) <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
      <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">404</span> { error<span class="fu">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="fu">&lt;&gt;</span> sUserId }
      <span class="dt">Just</span> user <span class="ot">-&gt;</span> respond <span class="dv">200</span> (encode user)

<span class="ot">respond ::</span> forall eff a<span class="fu">.</span> <span class="dt">Int</span> <span class="ot">-&gt;</span> a <span class="ot">-&gt;</span> <span class="dt">Handler</span> eff
respond status body <span class="fu">=</span> <span class="kw">do</span>
  setStatus status
  sendJson body

<span class="ot">respondNoContent ::</span> forall eff<span class="fu">.</span> <span class="dt">Int</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> eff
respondNoContent status <span class="fu">=</span> <span class="kw">do</span>
  setStatus status
  end</code></pre></div>
<p><code>getUser</code> validates the route parameter for valid user ID, sending error HTTP responses in case of failures. It then calls <code>findUser</code> to find the user and returns appropriate response.</p>
<p>We can test this on the command-line using <a href="https://httpie.org" target="_blank" rel="noopener">HTTPie</a>. We run <code>pulp --watch run</code> in one terminal to start the server with file watching, and test it from another terminal:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">pulp</span> --watch run
<span class="ex">*</span> Building project in ps-simple-rest-service
<span class="ex">*</span> Build successful.
<span class="ex">Server</span> listening on :4000</code></pre></div>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/1 # should return the user we created earlier
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 25
Content-Type: application/json; charset=utf-8
Date: Sun, 10 Sep 2017 14:32:52 GMT
ETag: W/&quot;19-qmtK9XY+WDrqHTgqtFlV+h+NGOY&quot;
X-Powered-By: Express

{
    &quot;id&quot;: 1,
    &quot;name&quot;: &quot;Abhinav&quot;
}</code></pre>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/s
HTTP/1.1 422 Unprocessable Entity
Connection: keep-alive
Content-Length: 38
Content-Type: application/json; charset=utf-8
Date: Sun, 10 Sep 2017 14:36:04 GMT
ETag: W/&quot;26-//tvORl1gGDUMwgSaqbEpJhuadI&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User ID must be an integer: s&quot;
}</code></pre>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/2
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 36
Content-Type: application/json; charset=utf-8
Date: Sun, 10 Sep 2017 14:36:11 GMT
ETag: W/&quot;24-IyD5VT4E8/m3kvpwycRBQunI7Uc&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User not found with id: 2&quot;
}</code></pre>
<h3 id="deleting-a-user">Deleting a User<a href="#deleting-a-user" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h3>
<p><code>deleteUser</code> handler is similar. We add the route in the <code>app</code> function in the <code>src/SimpleService/Server.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Node.Express.App</span> (<span class="dt">App</span>, delete, get, listenHttp)
<span class="kw">import </span><span class="dt">SimpleService.Handler</span> (deleteUser, getUser)
<span class="co">-- previous code</span>

<span class="ot">app ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
app pool <span class="fu">=</span> <span class="kw">do</span>
  get <span class="st">&quot;/v1/user/:id&quot;</span> <span class="fu">$</span> getUser pool
  delete <span class="st">&quot;/v1/user/:id&quot;</span> <span class="fu">$</span> deleteUser pool

<span class="co">-- previous code</span></code></pre></div>
<p>And we add the handler in the <code>src/SimpleService/Handler.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="ot">deleteUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
deleteUser pool <span class="fu">=</span> getRouteParam <span class="st">&quot;id&quot;</span> <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
  <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { error<span class="fu">:</span> <span class="st">&quot;User ID is required&quot;</span> }
  <span class="dt">Just</span> sUserId <span class="ot">-&gt;</span> <span class="kw">case</span> fromString sUserId <span class="kw">of</span>
    <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { error<span class="fu">:</span> <span class="st">&quot;User ID must be an integer: &quot;</span> <span class="fu">&lt;&gt;</span> sUserId }
    <span class="dt">Just</span> userId <span class="ot">-&gt;</span> <span class="kw">do</span>
      found <span class="ot">&lt;-</span> liftAff <span class="fu">$</span> PG.withConnection pool \conn <span class="ot">-&gt;</span> PG.withTransaction conn <span class="kw">do</span>
        P.findUser conn userId <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
          <span class="dt">Nothing</span> <span class="ot">-&gt;</span> pure false
          <span class="dt">Just</span> _  <span class="ot">-&gt;</span> <span class="kw">do</span>
            P.deleteUser conn userId
            pure true
      <span class="kw">if</span> found
        <span class="kw">then</span> respondNoContent <span class="dv">204</span>
        <span class="kw">else</span> respond <span class="dv">404</span> { error<span class="fu">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="fu">&lt;&gt;</span> sUserId }</code></pre></div>
<p>After the usual validations on the route param, <code>deleteUser</code> tries to find the user by the given user ID and if found, it deletes the user. Both the persistence related functions are run inside a single SQL transaction using <code>PG.withTransaction</code> function. <code>deleteUser</code> return 404 status if the user is not found, else it returns 204 status.</p>
<p>Let’s try it out:</p>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/1
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 25
Content-Type: application/json; charset=utf-8
Date: Mon, 11 Sep 2017 05:10:50 GMT
ETag: W/&quot;19-GC9FAtbd81t7CtrQgsNuc8HITXU&quot;
X-Powered-By: Express

{
    &quot;id&quot;: 1,
    &quot;name&quot;: &quot;Abhinav&quot;
}</code></pre>
<pre class="http"><code>$ http DELETE http://localhost:4000/v1/user/1
HTTP/1.1 204 No Content
Connection: keep-alive
Date: Mon, 11 Sep 2017 05:10:56 GMT
X-Powered-By: Express</code></pre>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/1
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 37
Content-Type: application/json; charset=utf-8
Date: Mon, 11 Sep 2017 05:11:03 GMT
ETag: W/&quot;25-Eoc4ZbEF73CyW8EGh6t2jqI8mLU&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User not found with id: 1&quot;
}</code></pre>
<pre class="http"><code>$ http DELETE http://localhost:4000/v1/user/1
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 37
Content-Type: application/json; charset=utf-8
Date: Mon, 11 Sep 2017 05:11:05 GMT
ETag: W/&quot;25-Eoc4ZbEF73CyW8EGh6t2jqI8mLU&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User not found with id: 1&quot;
}</code></pre>
<h3 id="creating-a-user">Creating a User<a href="#creating-a-user" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h3>
<p><code>createUser</code> handler is a bit more involved. First, we add an Express middleware to parse the body of the request as JSON. We use <a href="https://github.com/expressjs/body-parser" target="_blank" rel="noopener"><code>body-parser</code></a> for this and access it through Purescript <a href="https://github.com/purescript/documentation/blob/master/guides/FFI.md" target="_blank" rel="noopener">FFI</a>. We create a new file <code>src/SimpleService/Middleware/BodyParser.js</code> with the content:</p>
<div class="sourceCode"><pre class="sourceCode javascript"><code class="sourceCode javascript"><span class="st">&quot;use strict&quot;</span><span class="op">;</span>

<span class="kw">var</span> bodyParser <span class="op">=</span> <span class="at">require</span>(<span class="st">&quot;body-parser&quot;</span>)<span class="op">;</span>

<span class="va">exports</span>.<span class="at">jsonBodyParser</span> <span class="op">=</span> <span class="va">bodyParser</span>.<span class="at">json</span>(<span class="op">{</span>
  <span class="dt">limit</span><span class="op">:</span> <span class="st">&quot;5mb&quot;</span>
<span class="op">}</span>)<span class="op">;</span></code></pre></div>
<p>And write a wrapper for it in the file <code>src/SimpleService/Middleware/BodyParser.purs</code> with the content:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">SimpleService.Middleware.BodyParser</span> <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>
<span class="kw">import </span><span class="dt">Data.Function.Uncurried</span> (<span class="dt">Fn3</span>)
<span class="kw">import </span><span class="dt">Node.Express.Types</span> (<span class="dt">ExpressM</span>, <span class="dt">Response</span>, <span class="dt">Request</span>)

foreign <span class="kw">import </span>jsonBodyParser ::
  forall e<span class="fu">.</span> <span class="dt">Fn3</span> <span class="dt">Request</span> <span class="dt">Response</span> (<span class="dt">ExpressM</span> e <span class="dt">Unit</span>) (<span class="dt">ExpressM</span> e <span class="dt">Unit</span>)</code></pre></div>
<p>We also install the <code>body-parser</code> npm dependency:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">npm</span> install --save body-parser</code></pre></div>
<p>Next, we change the <code>app</code> function in the <code>src/SimpleService/Server.purs</code> file to add the middleware and the route:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Node.Express.App</span> (<span class="dt">App</span>, delete, get, listenHttp, post, useExternal)
<span class="kw">import </span><span class="dt">SimpleService.Handler</span> (createUser, deleteUser, getUser)
<span class="kw">import </span><span class="dt">SimpleService.Middleware.BodyParser</span> (jsonBodyParser)
<span class="co">-- previous code</span>

<span class="ot">app ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
app pool <span class="fu">=</span> <span class="kw">do</span>
  useExternal jsonBodyParser

  get <span class="st">&quot;/v1/user/:id&quot;</span> <span class="fu">$</span> getUser pool
  delete <span class="st">&quot;/v1/user/:id&quot;</span> <span class="fu">$</span> deleteUser pool
  post <span class="st">&quot;/v1/users&quot;</span> <span class="fu">$</span> createUser pool</code></pre></div>
<p>And finally, we write the handler in the <code>src/SimpleService/Handler.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Data.Either</span> (<span class="dt">Either</span>(..))
<span class="kw">import </span><span class="dt">Data.Foldable</span> (intercalate)
<span class="kw">import </span><span class="dt">Data.Foreign</span> (renderForeignError)
<span class="kw">import </span><span class="dt">Node.Express.Request</span> (getBody, getRouteParam)
<span class="kw">import </span><span class="dt">SimpleService.Types</span>
<span class="co">-- previous code</span>

<span class="ot">createUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
createUser pool <span class="fu">=</span> getBody <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
  <span class="dt">Left</span> errs <span class="ot">-&gt;</span> respond <span class="dv">422</span> { error<span class="fu">:</span> intercalate <span class="st">&quot;, &quot;</span> <span class="fu">$</span> map renderForeignError errs}
  <span class="dt">Right</span> u<span class="fu">@</span>(<span class="dt">User</span> user) <span class="ot">-&gt;</span>
    <span class="kw">if</span> user<span class="fu">.</span>id <span class="fu">&lt;=</span> <span class="dv">0</span>
      <span class="kw">then</span> respond <span class="dv">422</span> { error<span class="fu">:</span> <span class="st">&quot;User ID must be positive: &quot;</span> <span class="fu">&lt;&gt;</span> show user<span class="fu">.</span>id}
      <span class="kw">else</span> <span class="kw">if</span> user<span class="fu">.</span>name <span class="fu">==</span> <span class="st">&quot;&quot;</span>
        <span class="kw">then</span> respond <span class="dv">422</span> { error<span class="fu">:</span> <span class="st">&quot;User name must not be empty&quot;</span> }
        <span class="kw">else</span> <span class="kw">do</span>
          liftAff (PG.withConnection pool <span class="fu">$</span> flip P.insertUser u)
          respondNoContent <span class="dv">201</span></code></pre></div>
<p><code>createUser</code> calls <a href="https://pursuit.purescript.org/packages/purescript-express/0.5.2/docs/Node.Express.Request#v:getBody" target="_blank" rel="noopener"><code>getBody</code></a> which has type signature <code>forall e a. (Decode a) =&gt; HandlerM (express :: EXPRESS | e) (Either MultipleErrors a)</code>. It returns either a list of parsing errors or a parsed instance, which in our case, is a <code>User</code>. In case of errors, we just return the errors rendered as string with a 422 status. If we get a parsed <code>User</code> instance, we do some validations on it, returning appropriate error messages. If all validations pass, we create the user in the DB by calling <code>insertUser</code> from the persistence layer and respond with a status 201.</p>
<p>We can try it out:</p>
<pre class="http"><code>$ http POST http://localhost:4000/v1/users name=&quot;abhinav&quot;
HTTP/1.1 422 Unprocessable Entity
Connection: keep-alive
Content-Length: 97
Content-Type: application/json; charset=utf-8
Date: Mon, 11 Sep 2017 05:51:28 GMT
ETag: W/&quot;61-BgsrMukZpImcdwAJEKCZ+70WBb8&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;Error at array index 0: (ErrorAtProperty \&quot;id\&quot; (TypeMismatch \&quot;Int\&quot; \&quot;Undefined\&quot;))&quot;
}</code></pre>
<pre class="http"><code>$ http POST http://localhost:4000/v1/users id:=1 name=&quot;&quot;
HTTP/1.1 422 Unprocessable Entity
Connection: keep-alive
Content-Length: 39
Content-Type: application/json; charset=utf-8
Date: Mon, 11 Sep 2017 05:51:42 GMT
ETag: W/&quot;27-JQsh12xu/rEFdWy8REF4NMtBUB4&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User name must not be empty&quot;
}</code></pre>
<pre class="http"><code>$ http POST http://localhost:4000/v1/users id:=1 name=&quot;abhinav&quot;
HTTP/1.1 201 Created
Connection: keep-alive
Content-Length: 0
Date: Mon, 11 Sep 2017 05:52:23 GMT
X-Powered-By: Express</code></pre>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/1
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 25
Content-Type: application/json; charset=utf-8
Date: Mon, 11 Sep 2017 05:52:30 GMT
ETag: W/&quot;19-GC9FAtbd81t7CtrQgsNuc8HITXU&quot;
X-Powered-By: Express

{
    &quot;id&quot;: 1,
    &quot;name&quot;: &quot;abhinav&quot;
}</code></pre>
<p>First try returns a parsing failure because we didn’t provide the <code>id</code> field. Second try is a validation failure because the name was empty. Third try is a success which we check by doing a <code>GET</code> request next.</p>
<h3 id="updating-a-user">Updating a User<a href="#updating-a-user" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h3>
<p>We want to allow a user’s name to be updated through the API, but not the user’s id. So we add a new type to <code>src/SimpleService/Types.purs</code> to represent a possible change in user’s name:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Data.Foreign.NullOrUndefined</span> (<span class="dt">NullOrUndefined</span>)
<span class="co">-- previous code</span>

<span class="kw">newtype</span> <span class="dt">UserPatch</span> <span class="fu">=</span> <span class="dt">UserPatch</span> {<span class="ot"> name ::</span> <span class="dt">NullOrUndefined</span> <span class="dt">String</span> }

derive <span class="kw">instance</span><span class="ot"> genericUserPatch ::</span> <span class="dt">Generic</span> <span class="dt">UserPatch</span> _

<span class="kw">instance</span><span class="ot"> decodeUserPatch ::</span> <span class="dt">Decode</span> <span class="dt">UserPatch</span> <span class="kw">where</span>
  decode <span class="fu">=</span> genericDecode <span class="fu">$</span> defaultOptions { unwrapSingleConstructors <span class="fu">=</span> true }</code></pre></div>
<p><a href="https://pursuit.purescript.org/packages/purescript-foreign-generic/4.3.0/docs/Data.Foreign.NullOrUndefined#t:NullOrUndefined" target="_blank" rel="noopener"><code>NullOrUndefined</code></a> is a wrapper over <code>Maybe</code> with added support for Javascript <code>null</code> and <code>undefined</code> values. We define <code>UserPatch</code> as having a possibly null (or undefined) <code>name</code> field.</p>
<p>Now we can add the corresponding handler in <code>src/SimpleService/Handlers.purs</code>:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Data.Foreign.NullOrUndefined</span> (unNullOrUndefined)
<span class="co">-- previous code</span>

<span class="ot">updateUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
updateUser pool <span class="fu">=</span> getRouteParam <span class="st">&quot;id&quot;</span> <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
  <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { error<span class="fu">:</span> <span class="st">&quot;User ID is required&quot;</span> }
  <span class="dt">Just</span> sUserId <span class="ot">-&gt;</span> <span class="kw">case</span> fromString sUserId <span class="kw">of</span>
    <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { error<span class="fu">:</span> <span class="st">&quot;User ID must be positive: &quot;</span> <span class="fu">&lt;&gt;</span> sUserId }
    <span class="dt">Just</span> userId <span class="ot">-&gt;</span> getBody <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
      <span class="dt">Left</span> errs <span class="ot">-&gt;</span> respond <span class="dv">422</span> { error<span class="fu">:</span> intercalate <span class="st">&quot;, &quot;</span> <span class="fu">$</span> map renderForeignError errs}
      <span class="dt">Right</span> (<span class="dt">UserPatch</span> userPatch) <span class="ot">-&gt;</span> <span class="kw">case</span> unNullOrUndefined userPatch<span class="fu">.</span>name <span class="kw">of</span>
        <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respondNoContent <span class="dv">204</span>
        <span class="dt">Just</span> userName <span class="ot">-&gt;</span> <span class="kw">if</span> userName <span class="fu">==</span> <span class="st">&quot;&quot;</span>
          <span class="kw">then</span> respond <span class="dv">422</span> { error<span class="fu">:</span> <span class="st">&quot;User name must not be empty&quot;</span> }
          <span class="kw">else</span> <span class="kw">do</span>
            savedUser <span class="ot">&lt;-</span> liftAff <span class="fu">$</span> PG.withConnection pool \conn <span class="ot">-&gt;</span> PG.withTransaction conn <span class="kw">do</span>
              P.findUser conn userId <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
                <span class="dt">Nothing</span> <span class="ot">-&gt;</span> pure <span class="dt">Nothing</span>
                <span class="dt">Just</span> (<span class="dt">User</span> user) <span class="ot">-&gt;</span> <span class="kw">do</span>
                  <span class="kw">let</span> user' <span class="fu">=</span> <span class="dt">User</span> (user { name <span class="fu">=</span> userName })
                  P.updateUser conn user'
                  pure <span class="fu">$</span> <span class="dt">Just</span> user'
            <span class="kw">case</span> savedUser <span class="kw">of</span>
              <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">404</span> { error<span class="fu">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="fu">&lt;&gt;</span> sUserId }
              <span class="dt">Just</span> user <span class="ot">-&gt;</span> respond <span class="dv">200</span> (encode user)</code></pre></div>
<p>After checking for a valid user ID as before, we get the decoded request body as a <code>UserPatch</code> instance. If the path does not have the name field or has it as <code>null</code>, there is nothing to do and we respond with a 204 status. If the user name is present in the patch, we validate it for non-emptiness. Then, within a DB transaction, we try to find the user with the given ID, responding with a 404 status if the user is not found. If the user is found, we update the user’s name in the database, and respond with a 200 status and the saved user encoded as the JSON response body.</p>
<p>Finally, we can add the route to our server’s router in <code>src/SimpleService/Server.purs</code> to make the functionality available:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Node.Express.App</span> (<span class="dt">App</span>, delete, get, http, listenHttp, post, useExternal)
<span class="kw">import </span><span class="dt">Node.Express.Types</span> (<span class="dt">EXPRESS</span>, <span class="dt">Method</span>(..))
<span class="kw">import </span><span class="dt">SimpleService.Handler</span> (createUser, deleteUser, getUser, updateUser)
<span class="co">-- previous code</span>

<span class="ot">app ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
app pool <span class="fu">=</span> <span class="kw">do</span>
  useExternal jsonBodyParser

  get <span class="st">&quot;/v1/user/:id&quot;</span>    <span class="fu">$</span> getUser pool
  delete <span class="st">&quot;/v1/user/:id&quot;</span> <span class="fu">$</span> deleteUser pool
  post <span class="st">&quot;/v1/users&quot;</span>      <span class="fu">$</span> createUser pool
  patch <span class="st">&quot;/v1/user/:id&quot;</span>  <span class="fu">$</span> updateUser pool
  <span class="kw">where</span>
    patch <span class="fu">=</span> http (<span class="dt">CustomMethod</span> <span class="st">&quot;patch&quot;</span>)</code></pre></div>
<p>We can try it out now:</p>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/1
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 26
Content-Type: application/json; charset=utf-8
Date: Fri, 11 Sep 2017 06:41:10 GMT
ETag: W/&quot;1a-hoLBx55zeY8nZFWJh/kM05pXwSA&quot;
X-Powered-By: Express

{
    &quot;id&quot;: 1,
    &quot;name&quot;: &quot;abhinav&quot;
}</code></pre>
<pre class="http"><code>$ http PATCH http://localhost:4000/v1/user/1 name=abhinavsarkar
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 31
Content-Type: application/json; charset=utf-8
Date: Fri, 11 Sep 2017 06:41:36 GMT
ETag: W/&quot;1f-EG5i0hq/hYhF0BsuheD9hNXeBpI&quot;
X-Powered-By: Express

{
    &quot;id&quot;: 1,
    &quot;name&quot;: &quot;abhinavsarkar&quot;
}</code></pre>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/1
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 31
Content-Type: application/json; charset=utf-8
Date: Fri, 11 Sep 2017 06:41:40 GMT
ETag: W/&quot;1f-EG5i0hq/hYhF0BsuheD9hNXeBpI&quot;
X-Powered-By: Express

{
    &quot;id&quot;: 1,
    &quot;name&quot;: &quot;abhinavsarkar&quot;
}</code></pre>
<pre class="http"><code>$ http PATCH http://localhost:4000/v1/user/1
HTTP/1.1 204 No Content
Connection: keep-alive
Date: Fri, 11 Sep 2017 06:42:31 GMT
X-Powered-By: Express</code></pre>
<pre class="http"><code>$ http PATCH http://localhost:4000/v1/user/1 name=&quot;&quot;
HTTP/1.1 422 Unprocessable Entity
Connection: keep-alive
Content-Length: 39
Content-Type: application/json; charset=utf-8
Date: Fri, 11 Sep 2017 06:43:17 GMT
ETag: W/&quot;27-JQsh12xu/rEFdWy8REF4NMtBUB4&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User name must not be empty&quot;
}</code></pre>
<h3 id="listing-all-users">Listing all Users<a href="#listing-all-users" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h3>
<p>Listing all users is quite simple since it doesn’t require us to take any request parameter.</p>
<p>We add the handler to the <code>src/SimpleService/Handler.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="ot">listUsers ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
listUsers pool <span class="fu">=</span> liftAff (PG.withConnection pool P.listUsers) <span class="fu">&gt;&gt;=</span> encode <span class="fu">&gt;&gt;&gt;</span> respond <span class="dv">200</span></code></pre></div>
<p>And the route to the <code>src/SimpleService/Server.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">SimpleService.Handler</span> (createUser, deleteUser, getUser, listUsers, updateUser)
<span class="co">-- previous code</span>

<span class="ot">app ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
app pool <span class="fu">=</span> <span class="kw">do</span>
  useExternal jsonBodyParser

  get <span class="st">&quot;/v1/user/:id&quot;</span>    <span class="fu">$</span> getUser pool
  delete <span class="st">&quot;/v1/user/:id&quot;</span> <span class="fu">$</span> deleteUser pool
  post <span class="st">&quot;/v1/users&quot;</span>      <span class="fu">$</span> createUser pool
  patch <span class="st">&quot;/v1/user/:id&quot;</span>  <span class="fu">$</span> updateUser pool
  get <span class="st">&quot;/v1/users&quot;</span>       <span class="fu">$</span> listUsers pool
  <span class="kw">where</span>
    patch <span class="fu">=</span> http (<span class="dt">CustomMethod</span> <span class="st">&quot;patch&quot;</span>)</code></pre></div>
<p>And that’s it. We can test this endpoint:</p>
<pre class="http"><code>$ http POST http://localhost:4000/v1/users id:=2 name=sarkarabhinav
HTTP/1.1 201 Created
Connection: keep-alive
Content-Length: 0
Date: Fri, 11 Sep 2017 07:06:24 GMT
X-Powered-By: Express</code></pre>
<pre class="http"><code>$ http GET http://localhost:4000/v1/users
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 65
Content-Type: application/json; charset=utf-8
Date: Fri, 11 Sep 2017 07:06:27 GMT
ETag: W/&quot;41-btt9uNdG+9A1RO7SCLOsyMmIyFo&quot;
X-Powered-By: Express

[
    {
        &quot;id&quot;: 1,
        &quot;name&quot;: &quot;abhinavsarkar&quot;
    },
    {
        &quot;id&quot;: 2,
        &quot;name&quot;: &quot;sarkarabhinav&quot;
    }
]</code></pre>
<h2 id="conclusion">Conclusion<a href="#conclusion" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>That concludes the first part of the two-part tutorial. We learned how to set up a Purescript project, how to access a Postgres database and how to create a JSON REST API over the database. The code till the end of this part can be found in <a href="https://github.com/abhin4v/ps-simple-rest-service/tree/9fdfe3a15508a3c29bd4bc96310fcf52b1022678" target="_blank" rel="noopener">github</a>. In the <a href="https://abhinavsarkar.net/posts/ps-simple-rest-service-2/">next</a> part, we’ll learn how to do API validation, application configuration and logging. This post can be discussed on <a href="https://www.reddit.com/r/purescript/comments/737bg1/writing_a_simple_rest_service_in_purescript/" target="_blank" rel="noopener">r/purescript</a>.</p><p>If you liked this post, please <a href="https://abhinavsarkar.net/posts/ps-simple-rest-service/#comment-container">leave a comment</a>.</p><div class="author">
  <img src="https://nilenso.com/images/people/abhinav-200.png" style="width: 96px; height: 96;">
  <span style="position: absolute; padding: 32px 15px;">
    <i>Original post by <a href="http://twitter.com/abhin4v">Abhinav Sarkar</a> - check out <a href="https://abhinavsarkar.net">All posts on abhinavsarkar.net</a></i>
  </span>
</div>