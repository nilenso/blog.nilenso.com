---
title: "Writing a Simple REST Web Service in PureScript - Part 1"
kind: article
created_at: 2017-09-29 00:00:00 UTC
author: Abhinav Sarkar
post_url: "https://abhinavsarkar.net/posts/ps-simple-rest-service/"
layout: post
---
<p>At <a href="https://nilenso.com" target="_blank" rel="noopener">Nilenso</a>, we’ve been working with a client who has chosen <a href="https://purescript.org" target="_blank" rel="noopener">PureScript</a> as their primary programming language. Since I couldn’t find any canonical documentation on writing a web service in PureScript, I thought I’d jot down the approach that we took.</p>
<p>The aim of this two-part tutorial is to create a simple JSON <a href="https://en.wikipedia.org/wiki/REST" target="_blank" rel="noopener">REST</a> web service written in PureScript, to run on a node.js server. <!--more--> This assumes that you have basic proficiency with PureScript. We have the following requirements:</p>
<ol type="1">
<li>persisting users into a Postgres database.</li>
<li>API endpoints for creating, updating, getting, listing and deleting users.</li>
<li>validation of API requests.</li>
<li>reading the server and database configs from environment variables.</li>
<li>logging HTTP requests and debugging info.</li>
</ol>
<p>In this part we’ll work on setting up the project and on the first two requirements. In the <a href="https://abhinavsarkar.net/posts/ps-simple-rest-service-2/">next</a> part we’ll work on the rest of the requirements.</p>
<nav id="toc" class="right-toc"><h3>Contents</h3><ol><li><a href="#setting-up">Setting Up</a></li><li><a href="#types-first">Types First</a></li><li><a href="#persisting-it">Persisting It</a></li><li><a href="#serving-it">Serving It</a><ol><li><a href="#getting-a-user">Getting a User</a></li><li><a href="#deleting-a-user">Deleting a User</a></li><li><a href="#creating-a-user">Creating a User</a></li><li><a href="#updating-a-user">Updating a User</a></li><li><a href="#listing-all-users">Listing all Users</a></li></ol></li><li><a href="#conclusion">Conclusion</a></li></ol></nav>
<h2 id="setting-up" data-track-content data-content-name="setting-up" data-content-piece="ps-simple-rest-service">Setting Up<a href="#setting-up" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>We start with installing PureScript and the required tools. This assumes that we have <a href="https://nodejs.org" target="_blank" rel="noopener">node</a> and <a href="https://www.npmjs.com" target="_blank" rel="noopener">npm</a> installed on our machine.</p>
<div class="sourceCode" id="cb1"><pre class="sourceCode bash"><code class="sourceCode bash"><span id="cb1-1"><a href="#cb1-1"></a>$ <span class="fu">mkdir</span> -p ~/.local/</span>
<span id="cb1-2"><a href="#cb1-2"></a>$ <span class="ex">npm</span> install -g purescript pulp bower --prefix ~/.local/</span></code></pre></div>
<p><a href="https://github.com/purescript-contrib/pulp" target="_blank" rel="noopener">Pulp</a> is a build tool for PureScript projects and <a href="https://bower.io" target="_blank" rel="noopener">bower</a> is a package manager used to get PureScript libraries. We’ll have to add <code>~/.local/bin</code> in our <code>$PATH</code> (if it is not already added) to access the binaries installed.</p>
<p>Let’s create a directory for our project and make Pulp initialize it:</p>
<div class="sourceCode" id="cb2"><pre class="sourceCode bash"><code class="sourceCode bash"><span id="cb2-1"><a href="#cb2-1"></a>$ <span class="fu">mkdir</span> ps-simple-rest-service</span>
<span id="cb2-2"><a href="#cb2-2"></a>$ <span class="bu">cd</span> ps-simple-rest-service</span>
<span id="cb2-3"><a href="#cb2-3"></a>$ <span class="ex">pulp</span> init</span>
<span id="cb2-4"><a href="#cb2-4"></a>$ <span class="fu">ls</span></span>
<span id="cb2-5"><a href="#cb2-5"></a><span class="ex">bower.json</span>  bower_components  src  test</span>
<span id="cb2-6"><a href="#cb2-6"></a>$ <span class="fu">cat</span> bower.json</span>
<span id="cb2-7"><a href="#cb2-7"></a><span class="kw">{</span></span>
<span id="cb2-8"><a href="#cb2-8"></a>  <span class="st">&quot;name&quot;</span>: <span class="st">&quot;ps-simple-rest-service&quot;</span>,</span>
<span id="cb2-9"><a href="#cb2-9"></a>  <span class="st">&quot;ignore&quot;</span>:<span class="bu"> [</span></span>
<span id="cb2-10"><a href="#cb2-10"></a>    <span class="st">&quot;**/.*&quot;</span>,</span>
<span id="cb2-11"><a href="#cb2-11"></a>    <span class="st">&quot;node_modules&quot;</span>,</span>
<span id="cb2-12"><a href="#cb2-12"></a>    <span class="st">&quot;bower_components&quot;</span>,</span>
<span id="cb2-13"><a href="#cb2-13"></a>    <span class="st">&quot;output&quot;</span></span>
<span id="cb2-14"><a href="#cb2-14"></a>  ],</span>
<span id="cb2-15"><a href="#cb2-15"></a>  <span class="st">&quot;dependencies&quot;</span>: {</span>
<span id="cb2-16"><a href="#cb2-16"></a>    <span class="st">&quot;purescript-prelude&quot;</span>: <span class="st">&quot;^3.1.0&quot;</span>,</span>
<span id="cb2-17"><a href="#cb2-17"></a>    <span class="st">&quot;purescript-console&quot;</span>: <span class="st">&quot;^3.0.0&quot;</span></span>
<span id="cb2-18"><a href="#cb2-18"></a>  },</span>
<span id="cb2-19"><a href="#cb2-19"></a>  <span class="st">&quot;devDependencies&quot;</span>: {</span>
<span id="cb2-20"><a href="#cb2-20"></a>    <span class="st">&quot;purescript-psci-support&quot;</span>: <span class="st">&quot;^3.0.0&quot;</span></span>
<span id="cb2-21"><a href="#cb2-21"></a>  }</span>
<span id="cb2-22"><a href="#cb2-22"></a>}</span>
<span id="cb2-23"><a href="#cb2-23"></a>$ ls bower_components</span>
<span id="cb2-24"><a href="#cb2-24"></a>purescript-console  purescript-eff  purescript-prelude purescript-psci-support</span></code></pre></div>
<p>Pulp creates the basic project structure for us. <code>src</code> directory will contain the source while the <code>test</code> directory will contain the tests. <code>bower.json</code> contains the PureScript libraries as dependencies which are downloaded and installed in the <code>bower_components</code> directory.</p>
<div class="page-break">

</div>
<h2 id="types-first" data-track-content data-content-name="types-first" data-content-piece="ps-simple-rest-service">Types First<a href="#types-first" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>First, we create the types needed in <code>src/SimpleService/Types.purs</code>:</p>
<div class="sourceCode" id="cb3"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb3-1"><a href="#cb3-1"></a><span class="kw">module</span> <span class="dt">SimpleService.Types</span> <span class="kw">where</span></span>
<span id="cb3-2"><a href="#cb3-2"></a></span>
<span id="cb3-3"><a href="#cb3-3"></a><span class="kw">import</span> <span class="dt">Prelude</span></span>
<span id="cb3-4"><a href="#cb3-4"></a></span>
<span id="cb3-5"><a href="#cb3-5"></a><span class="kw">import</span> <span class="dt">Data.Foreign.Class</span> (class <span class="dt">Decode</span>, class <span class="dt">Encode</span>)</span>
<span id="cb3-6"><a href="#cb3-6"></a><span class="kw">import</span> <span class="dt">Data.Foreign.Generic</span> (defaultOptions, genericDecode, genericEncode)</span>
<span id="cb3-7"><a href="#cb3-7"></a><span class="kw">import</span> <span class="dt">Data.Generic.Rep</span> (class <span class="dt">Generic</span>)</span>
<span id="cb3-8"><a href="#cb3-8"></a><span class="kw">import</span> <span class="dt">Data.Generic.Rep.Show</span> (genericShow)</span>
<span id="cb3-9"><a href="#cb3-9"></a></span>
<span id="cb3-10"><a href="#cb3-10"></a><span class="kw">type</span> <span class="dt">UserID</span> <span class="ot">=</span> <span class="dt">Int</span></span>
<span id="cb3-11"><a href="#cb3-11"></a></span>
<span id="cb3-12"><a href="#cb3-12"></a><span class="kw">newtype</span> <span class="dt">User</span> <span class="ot">=</span> <span class="dt">User</span></span>
<span id="cb3-13"><a href="#cb3-13"></a>  {<span class="ot"> id   ::</span> <span class="dt">UserID</span></span>
<span id="cb3-14"><a href="#cb3-14"></a>  ,<span class="ot"> name ::</span> <span class="dt">String</span></span>
<span id="cb3-15"><a href="#cb3-15"></a>  }</span>
<span id="cb3-16"><a href="#cb3-16"></a></span>
<span id="cb3-17"><a href="#cb3-17"></a>derive <span class="kw">instance</span><span class="ot"> genericUser ::</span> <span class="dt">Generic</span> <span class="dt">User</span> _</span>
<span id="cb3-18"><a href="#cb3-18"></a></span>
<span id="cb3-19"><a href="#cb3-19"></a><span class="kw">instance</span><span class="ot"> showUser ::</span> <span class="dt">Show</span> <span class="dt">User</span> <span class="kw">where</span></span>
<span id="cb3-20"><a href="#cb3-20"></a>  <span class="fu">show</span> <span class="ot">=</span> genericShow</span>
<span id="cb3-21"><a href="#cb3-21"></a></span>
<span id="cb3-22"><a href="#cb3-22"></a><span class="kw">instance</span><span class="ot"> decodeUser ::</span> <span class="dt">Decode</span> <span class="dt">User</span> <span class="kw">where</span></span>
<span id="cb3-23"><a href="#cb3-23"></a>  decode <span class="ot">=</span> genericDecode <span class="op">$</span> defaultOptions { unwrapSingleConstructors <span class="ot">=</span> true }</span>
<span id="cb3-24"><a href="#cb3-24"></a></span>
<span id="cb3-25"><a href="#cb3-25"></a><span class="kw">instance</span><span class="ot"> encodeUser ::</span> <span class="dt">Encode</span> <span class="dt">User</span> <span class="kw">where</span></span>
<span id="cb3-26"><a href="#cb3-26"></a>  encode <span class="ot">=</span> genericEncode <span class="op">$</span> defaultOptions { unwrapSingleConstructors <span class="ot">=</span> true }</span></code></pre></div>
<p>We are using the generic support for PureScript types from the <a href="https://pursuit.purescript.org/packages/purescript-generics-rep" target="_blank" rel="noopener"><code>purescript-generics-rep</code></a> and <a href="https://pursuit.purescript.org/packages/purescript-foreign-generic" target="_blank" rel="noopener"><code>purescript-foreign-generic</code></a> libraries to encode and decode the <code>User</code> type to JSON. We install the library by running the following command:</p>
<div class="sourceCode" id="cb4"><pre class="sourceCode bash"><code class="sourceCode bash"><span id="cb4-1"><a href="#cb4-1"></a>$ <span class="ex">bower</span> install purescript-foreign-generic --save</span></code></pre></div>
<p>Now we can load up the module in the PureScript REPL and try out the JSON conversion features:</p>
<div class="sourceCode" id="cb5"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb5-1"><a href="#cb5-1"></a><span class="op">$</span> pulp repl</span>
<span id="cb5-2"><a href="#cb5-2"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">SimpleService.Types</span></span>
<span id="cb5-3"><a href="#cb5-3"></a><span class="op">&gt;</span> user <span class="ot">=</span> <span class="dt">User</span> { <span class="fu">id</span><span class="op">:</span> <span class="dv">1</span>, name<span class="op">:</span> <span class="st">&quot;Abhinav&quot;</span>}</span>
<span id="cb5-4"><a href="#cb5-4"></a><span class="op">&gt;</span> user</span>
<span id="cb5-5"><a href="#cb5-5"></a>(<span class="dt">User</span> { <span class="fu">id</span><span class="op">:</span> <span class="dv">1</span>, name<span class="op">:</span> <span class="st">&quot;Abhinav&quot;</span> })</span>
<span id="cb5-6"><a href="#cb5-6"></a></span>
<span id="cb5-7"><a href="#cb5-7"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">Data.Foreign.Generic</span></span>
<span id="cb5-8"><a href="#cb5-8"></a><span class="op">&gt;</span> userJSON <span class="ot">=</span> encodeJSON user</span>
<span id="cb5-9"><a href="#cb5-9"></a><span class="op">&gt;</span> userJSON</span>
<span id="cb5-10"><a href="#cb5-10"></a><span class="st">&quot;{\&quot;name\&quot;:\&quot;Abhinav\&quot;,\&quot;id\&quot;:1}&quot;</span></span>
<span id="cb5-11"><a href="#cb5-11"></a></span>
<span id="cb5-12"><a href="#cb5-12"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">Data.Foreign</span></span>
<span id="cb5-13"><a href="#cb5-13"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">Control.Monad.Except.Trans</span></span>
<span id="cb5-14"><a href="#cb5-14"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">Data.Identity</span></span>
<span id="cb5-15"><a href="#cb5-15"></a><span class="op">&gt;</span> dUser <span class="ot">=</span> decodeJSON<span class="ot"> userJSON ::</span> <span class="dt">F</span> <span class="dt">User</span></span>
<span id="cb5-16"><a href="#cb5-16"></a><span class="op">&gt;</span> eUser <span class="ot">=</span> <span class="kw">let</span> (<span class="dt">Identity</span> eUser) <span class="ot">=</span> runExceptT <span class="op">$</span> dUser <span class="kw">in</span> eUser</span>
<span id="cb5-17"><a href="#cb5-17"></a><span class="op">&gt;</span> eUser</span>
<span id="cb5-18"><a href="#cb5-18"></a>(<span class="dt">Right</span> (<span class="dt">User</span> { <span class="fu">id</span><span class="op">:</span> <span class="dv">1</span>, name<span class="op">:</span> <span class="st">&quot;Abhinav&quot;</span> }))</span></code></pre></div>
<p>We use <code>encodeJSON</code> and <code>decodeJSON</code> functions from the <a href="https://pursuit.purescript.org/packages/purescript-foreign-generic/4.3.0/docs/Data.Foreign.Generic" target="_blank" rel="noopener"><code>Data.Foreign.Generic</code></a> module to encode and decode the <code>User</code> instance to JSON. The return type of <code>decodeJSON</code> is a bit complicated as it needs to return the parsing errors too. In this case, the decoding returns no errors and we get back a <code>Right</code> with the correctly parsed <code>User</code> instance.</p>
<h2 id="persisting-it" data-track-content data-content-name="persisting-it" data-content-piece="ps-simple-rest-service">Persisting It<a href="#persisting-it" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>Next, we add the support for saving a <code>User</code> instance to a Postgres database. First, we install the required libraries using bower and npm: <a href="https://github.com/brianc/node-postgres" target="_blank" rel="noopener"><code>pg</code></a> for Javascript bindings to call Postgres, <a href="https://pursuit.purescript.org/packages/purescript-aff" target="_blank" rel="noopener"><code>purescript-aff</code></a> for asynchronous processing and <a href="https://pursuit.purescript.org/packages/purescript-postgresql-client" target="_blank" rel="noopener"><code>purescript-postgresql-client</code></a> for PureScript wrapper over <code>pg</code>:</p>
<div class="sourceCode" id="cb6"><pre class="sourceCode bash"><code class="sourceCode bash"><span id="cb6-1"><a href="#cb6-1"></a>$ <span class="ex">npm</span> init -y</span>
<span id="cb6-2"><a href="#cb6-2"></a>$ <span class="ex">npm</span> install pg@6.4.0 --save</span>
<span id="cb6-3"><a href="#cb6-3"></a>$ <span class="ex">bower</span> install purescript-aff --save</span>
<span id="cb6-4"><a href="#cb6-4"></a>$ <span class="ex">bower</span> install purescript-postgresql-client --save</span></code></pre></div>
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
<div class="sourceCode" id="cb8"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb8-1"><a href="#cb8-1"></a><span class="kw">import</span> <span class="dt">Data.Array</span> <span class="kw">as</span> <span class="dt">Array</span></span>
<span id="cb8-2"><a href="#cb8-2"></a><span class="kw">import</span> <span class="dt">Data.Either</span> (<span class="dt">Either</span>(..))</span>
<span id="cb8-3"><a href="#cb8-3"></a><span class="kw">import</span> <span class="dt">Database.PostgreSQL</span> (class <span class="dt">FromSQLRow</span>, class <span class="dt">ToSQLRow</span>, fromSQLValue, toSQLValue)</span>
<span id="cb8-4"><a href="#cb8-4"></a></span>
<span id="cb8-5"><a href="#cb8-5"></a><span class="co">-- code written earlier</span></span>
<span id="cb8-6"><a href="#cb8-6"></a></span>
<span id="cb8-7"><a href="#cb8-7"></a><span class="kw">instance</span><span class="ot"> userFromSQLRow ::</span> <span class="dt">FromSQLRow</span> <span class="dt">User</span> <span class="kw">where</span></span>
<span id="cb8-8"><a href="#cb8-8"></a>  fromSQLRow [<span class="fu">id</span>, name] <span class="ot">=</span></span>
<span id="cb8-9"><a href="#cb8-9"></a>    <span class="dt">User</span> <span class="op">&lt;$&gt;</span> ({ <span class="fu">id</span><span class="op">:</span> _, name<span class="op">:</span> _} <span class="op">&lt;$&gt;</span> fromSQLValue <span class="fu">id</span> <span class="op">&lt;*&gt;</span> fromSQLValue name)</span>
<span id="cb8-10"><a href="#cb8-10"></a></span>
<span id="cb8-11"><a href="#cb8-11"></a>  fromSQLRow xs <span class="ot">=</span> <span class="dt">Left</span> <span class="op">$</span> <span class="st">&quot;Row has &quot;</span> <span class="op">&lt;&gt;</span> <span class="fu">show</span> n <span class="op">&lt;&gt;</span> <span class="st">&quot; fields, expecting 2.&quot;</span></span>
<span id="cb8-12"><a href="#cb8-12"></a>    <span class="kw">where</span> n <span class="ot">=</span> Array.length xs</span>
<span id="cb8-13"><a href="#cb8-13"></a></span>
<span id="cb8-14"><a href="#cb8-14"></a><span class="kw">instance</span><span class="ot"> userToSQLRow ::</span> <span class="dt">ToSQLRow</span> <span class="dt">User</span> <span class="kw">where</span></span>
<span id="cb8-15"><a href="#cb8-15"></a>  toSQLRow (<span class="dt">User</span> {<span class="fu">id</span>, name}) <span class="ot">=</span> [toSQLValue <span class="fu">id</span>, toSQLValue name]</span></code></pre></div>
<p>We can try out the persistence support in the REPL:</p>
<div class="sourceCode" id="cb9"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb9-1"><a href="#cb9-1"></a><span class="op">$</span> pulp repl</span>
<span id="cb9-2"><a href="#cb9-2"></a><span class="dt">PSCi</span>, version <span class="fl">0.11</span><span class="op">.</span><span class="dv">6</span></span>
<span id="cb9-3"><a href="#cb9-3"></a><span class="dt">Type</span> <span class="op">:?</span> for help</span>
<span id="cb9-4"><a href="#cb9-4"></a></span>
<span id="cb9-5"><a href="#cb9-5"></a><span class="kw">import</span> <span class="dt">Prelude</span></span>
<span id="cb9-6"><a href="#cb9-6"></a><span class="op">&gt;</span></span>
<span id="cb9-7"><a href="#cb9-7"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">SimpleService.Types</span></span>
<span id="cb9-8"><a href="#cb9-8"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">Control.Monad.Aff</span> (launchAff, liftEff')</span>
<span id="cb9-9"><a href="#cb9-9"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span></span>
<span id="cb9-10"><a href="#cb9-10"></a><span class="op">&gt;</span> user <span class="ot">=</span> <span class="dt">User</span> { <span class="fu">id</span><span class="op">:</span> <span class="dv">1</span>, name<span class="op">:</span> <span class="st">&quot;Abhinav&quot;</span> }</span>
<span id="cb9-11"><a href="#cb9-11"></a><span class="op">&gt;</span> databaseConfig <span class="ot">=</span> {user<span class="op">:</span> <span class="st">&quot;abhinav&quot;</span>, password<span class="op">:</span> <span class="st">&quot;&quot;</span>, host<span class="op">:</span> <span class="st">&quot;localhost&quot;</span>, port<span class="op">:</span> <span class="dv">5432</span>, database<span class="op">:</span> <span class="st">&quot;simple_service&quot;</span>, <span class="fu">max</span><span class="op">:</span> <span class="dv">10</span>, idleTimeoutMillis<span class="op">:</span> <span class="dv">1000</span>}</span>
<span id="cb9-12"><a href="#cb9-12"></a></span>
<span id="cb9-13"><a href="#cb9-13"></a><span class="op">&gt;</span> <span class="op">:</span>paste</span>
<span id="cb9-14"><a href="#cb9-14"></a>… void <span class="op">$</span> launchAff <span class="kw">do</span></span>
<span id="cb9-15"><a href="#cb9-15"></a>…   pool <span class="ot">&lt;-</span> PG.newPool databaseConfig</span>
<span id="cb9-16"><a href="#cb9-16"></a>…   PG.withConnection pool <span class="op">$</span> \conn <span class="ot">-&gt;</span> <span class="kw">do</span></span>
<span id="cb9-17"><a href="#cb9-17"></a>…     PG.execute conn (<span class="dt">PG.Query</span> <span class="st">&quot;insert into users (id, name) values ($1, $2)&quot;</span>) user</span>
<span id="cb9-18"><a href="#cb9-18"></a>…</span>
<span id="cb9-19"><a href="#cb9-19"></a>unit</span>
<span id="cb9-20"><a href="#cb9-20"></a></span>
<span id="cb9-21"><a href="#cb9-21"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">Data.Foldable</span> (for_)</span>
<span id="cb9-22"><a href="#cb9-22"></a><span class="op">&gt;</span> <span class="kw">import</span> <span class="dt">Control.Monad.Eff.Console</span> (logShow)</span>
<span id="cb9-23"><a href="#cb9-23"></a><span class="op">&gt;</span> <span class="op">:</span>paste</span>
<span id="cb9-24"><a href="#cb9-24"></a>… void <span class="op">$</span> launchAff <span class="kw">do</span></span>
<span id="cb9-25"><a href="#cb9-25"></a>…   pool <span class="ot">&lt;-</span> PG.newPool databaseConfig</span>
<span id="cb9-26"><a href="#cb9-26"></a>…   PG.withConnection pool <span class="op">$</span> \conn <span class="ot">-&gt;</span> <span class="kw">do</span></span>
<span id="cb9-27"><a href="#cb9-27"></a>…<span class="ot">     users ::</span> <span class="dt">Array</span> <span class="dt">User</span> <span class="ot">&lt;-</span> PG.query conn (<span class="dt">PG.Query</span> <span class="st">&quot;select id, name from users where id = $1&quot;</span>) (<span class="dt">PG.Row1</span> <span class="dv">1</span>)</span>
<span id="cb9-28"><a href="#cb9-28"></a>…     liftEff' <span class="op">$</span> void <span class="op">$</span> for_ users logShow</span>
<span id="cb9-29"><a href="#cb9-29"></a>…</span>
<span id="cb9-30"><a href="#cb9-30"></a>unit</span>
<span id="cb9-31"><a href="#cb9-31"></a>(<span class="dt">User</span> { <span class="fu">id</span><span class="op">:</span> <span class="dv">1</span>, name<span class="op">:</span> <span class="st">&quot;Abhinav&quot;</span> })</span></code></pre></div>
<p>We create the <code>databaseConfig</code> record with the configs needed to connect to the database. Using the record, we create a new Postgres connection pool (<code>PG.newPool</code>) and get a connection from it (<code>PG.withConnection</code>). We call <code>PG.execute</code> with the connection, the SQL insert query for the users table and the <code>User</code> instance, to insert the user into the table. All of this is done inside <a href="https://pursuit.purescript.org/packages/purescript-aff/3.1.0/docs/Control.Monad.Aff#v:launchAff" target="_blank" rel="noopener"><code>launchAff</code></a> which takes care of sequencing the callbacks correctly to make the asynchronous code look synchronous.</p>
<p>Similarly, in the second part, we query the table using <code>PG.query</code> function by calling it with a connection, the SQL select query and the <code>User</code> ID as the query parameter. It returns an <code>Array</code> of users which we log to the console using the <code>logShow</code> function.</p>
<p>We use this experiment to write the persistence related code in the <code>src/SimpleService/Persistence.purs</code> file:</p>
<div class="sourceCode" id="cb10"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb10-1"><a href="#cb10-1"></a><span class="kw">module</span> <span class="dt">SimpleService.Persistence</span></span>
<span id="cb10-2"><a href="#cb10-2"></a>  ( insertUser</span>
<span id="cb10-3"><a href="#cb10-3"></a>  , findUser</span>
<span id="cb10-4"><a href="#cb10-4"></a>  , updateUser</span>
<span id="cb10-5"><a href="#cb10-5"></a>  , deleteUser</span>
<span id="cb10-6"><a href="#cb10-6"></a>  , listUsers</span>
<span id="cb10-7"><a href="#cb10-7"></a>  ) <span class="kw">where</span></span>
<span id="cb10-8"><a href="#cb10-8"></a></span>
<span id="cb10-9"><a href="#cb10-9"></a><span class="kw">import</span> <span class="dt">Prelude</span></span>
<span id="cb10-10"><a href="#cb10-10"></a></span>
<span id="cb10-11"><a href="#cb10-11"></a><span class="kw">import</span> <span class="dt">Control.Monad.Aff</span> (<span class="dt">Aff</span>)</span>
<span id="cb10-12"><a href="#cb10-12"></a><span class="kw">import</span> <span class="dt">Data.Array</span> <span class="kw">as</span> <span class="dt">Array</span></span>
<span id="cb10-13"><a href="#cb10-13"></a><span class="kw">import</span> <span class="dt">Data.Maybe</span> (<span class="dt">Maybe</span>)</span>
<span id="cb10-14"><a href="#cb10-14"></a><span class="kw">import</span> <span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span></span>
<span id="cb10-15"><a href="#cb10-15"></a><span class="kw">import</span> <span class="dt">SimpleService.Types</span> (<span class="dt">User</span>(..), <span class="dt">UserID</span>)</span>
<span id="cb10-16"><a href="#cb10-16"></a></span>
<span id="cb10-17"><a href="#cb10-17"></a><span class="ot">insertUserQuery ::</span> <span class="dt">String</span></span>
<span id="cb10-18"><a href="#cb10-18"></a>insertUserQuery <span class="ot">=</span> <span class="st">&quot;insert into users (id, name) values ($1, $2)&quot;</span></span>
<span id="cb10-19"><a href="#cb10-19"></a></span>
<span id="cb10-20"><a href="#cb10-20"></a><span class="ot">findUserQuery ::</span> <span class="dt">String</span></span>
<span id="cb10-21"><a href="#cb10-21"></a>findUserQuery <span class="ot">=</span> <span class="st">&quot;select id, name from users where id = $1&quot;</span></span>
<span id="cb10-22"><a href="#cb10-22"></a></span>
<span id="cb10-23"><a href="#cb10-23"></a><span class="ot">updateUserQuery ::</span> <span class="dt">String</span></span>
<span id="cb10-24"><a href="#cb10-24"></a>updateUserQuery <span class="ot">=</span> <span class="st">&quot;update users set name = $1 where id = $2&quot;</span></span>
<span id="cb10-25"><a href="#cb10-25"></a></span>
<span id="cb10-26"><a href="#cb10-26"></a><span class="ot">deleteUserQuery ::</span> <span class="dt">String</span></span>
<span id="cb10-27"><a href="#cb10-27"></a>deleteUserQuery <span class="ot">=</span> <span class="st">&quot;delete from users where id = $1&quot;</span></span>
<span id="cb10-28"><a href="#cb10-28"></a></span>
<span id="cb10-29"><a href="#cb10-29"></a><span class="ot">listUsersQuery ::</span> <span class="dt">String</span></span>
<span id="cb10-30"><a href="#cb10-30"></a>listUsersQuery <span class="ot">=</span> <span class="st">&quot;select id, name from users&quot;</span></span>
<span id="cb10-31"><a href="#cb10-31"></a></span>
<span id="cb10-32"><a href="#cb10-32"></a><span class="ot">insertUser ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Connection</span> <span class="ot">-&gt;</span> <span class="dt">User</span></span>
<span id="cb10-33"><a href="#cb10-33"></a>           <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff) <span class="dt">Unit</span></span>
<span id="cb10-34"><a href="#cb10-34"></a>insertUser conn user <span class="ot">=</span></span>
<span id="cb10-35"><a href="#cb10-35"></a>  PG.execute conn (<span class="dt">PG.Query</span> insertUserQuery) user</span>
<span id="cb10-36"><a href="#cb10-36"></a></span>
<span id="cb10-37"><a href="#cb10-37"></a><span class="ot">findUser ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Connection</span> <span class="ot">-&gt;</span> <span class="dt">UserID</span></span>
<span id="cb10-38"><a href="#cb10-38"></a>         <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff) (<span class="dt">Maybe</span> <span class="dt">User</span>)</span>
<span id="cb10-39"><a href="#cb10-39"></a>findUser conn userID <span class="ot">=</span></span>
<span id="cb10-40"><a href="#cb10-40"></a>  <span class="fu">map</span> Array.head <span class="op">$</span> PG.query conn (<span class="dt">PG.Query</span> findUserQuery) (<span class="dt">PG.Row1</span> userID)</span>
<span id="cb10-41"><a href="#cb10-41"></a></span>
<span id="cb10-42"><a href="#cb10-42"></a><span class="ot">updateUser ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Connection</span> <span class="ot">-&gt;</span> <span class="dt">User</span></span>
<span id="cb10-43"><a href="#cb10-43"></a>           <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff) <span class="dt">Unit</span></span>
<span id="cb10-44"><a href="#cb10-44"></a>updateUser conn (<span class="dt">User</span> {<span class="fu">id</span>, name}) <span class="ot">=</span></span>
<span id="cb10-45"><a href="#cb10-45"></a>  PG.execute conn (<span class="dt">PG.Query</span> updateUserQuery) (<span class="dt">PG.Row2</span> name <span class="fu">id</span>)</span>
<span id="cb10-46"><a href="#cb10-46"></a></span>
<span id="cb10-47"><a href="#cb10-47"></a><span class="ot">deleteUser ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Connection</span> <span class="ot">-&gt;</span> <span class="dt">UserID</span></span>
<span id="cb10-48"><a href="#cb10-48"></a>           <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff) <span class="dt">Unit</span></span>
<span id="cb10-49"><a href="#cb10-49"></a>deleteUser conn userID <span class="ot">=</span></span>
<span id="cb10-50"><a href="#cb10-50"></a>  PG.execute conn (<span class="dt">PG.Query</span> deleteUserQuery) (<span class="dt">PG.Row1</span> userID)</span>
<span id="cb10-51"><a href="#cb10-51"></a></span>
<span id="cb10-52"><a href="#cb10-52"></a><span class="ot">listUsers ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Connection</span></span>
<span id="cb10-53"><a href="#cb10-53"></a>          <span class="ot">-&gt;</span> <span class="dt">Aff</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff) (<span class="dt">Array</span> <span class="dt">User</span>)</span>
<span id="cb10-54"><a href="#cb10-54"></a>listUsers conn <span class="ot">=</span></span>
<span id="cb10-55"><a href="#cb10-55"></a>  PG.query conn (<span class="dt">PG.Query</span> listUsersQuery) <span class="dt">PG.Row0</span></span></code></pre></div>
<h2 id="serving-it" data-track-content data-content-name="serving-it" data-content-piece="ps-simple-rest-service">Serving It<a href="#serving-it" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>We can now write a simple HTTP API over the persistence layer using <a href="https://expressjs.com" target="_blank" rel="noopener">Express</a> to provide CRUD functionality for users. Let’s install Express and <a href="https://pursuit.purescript.org/packages/purescript-express" target="_blank" rel="noopener">purescript-express</a>, the PureScript wrapper over it:</p>
<div class="sourceCode" id="cb11"><pre class="sourceCode bash"><code class="sourceCode bash"><span id="cb11-1"><a href="#cb11-1"></a>$ <span class="ex">npm</span> install express --save</span>
<span id="cb11-2"><a href="#cb11-2"></a>$ <span class="ex">bower</span> install purescript-express --save</span></code></pre></div>
<h3 id="getting-a-user">Getting a User<a href="#getting-a-user" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h3>
<p>We do this top-down. First, we change <code>src/Main.purs</code> to run the HTTP server by providing the server port and database configuration:</p>
<div class="sourceCode" id="cb12"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb12-1"><a href="#cb12-1"></a><span class="kw">module</span> <span class="dt">Main</span> <span class="kw">where</span></span>
<span id="cb12-2"><a href="#cb12-2"></a></span>
<span id="cb12-3"><a href="#cb12-3"></a><span class="kw">import</span> <span class="dt">Prelude</span></span>
<span id="cb12-4"><a href="#cb12-4"></a></span>
<span id="cb12-5"><a href="#cb12-5"></a><span class="kw">import</span> <span class="dt">Control.Monad.Eff</span> (<span class="dt">Eff</span>)</span>
<span id="cb12-6"><a href="#cb12-6"></a><span class="kw">import</span> <span class="dt">Control.Monad.Eff.Console</span> (<span class="dt">CONSOLE</span>)</span>
<span id="cb12-7"><a href="#cb12-7"></a><span class="kw">import</span> <span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span></span>
<span id="cb12-8"><a href="#cb12-8"></a><span class="kw">import</span> <span class="dt">Node.Express.Types</span> (<span class="dt">EXPRESS</span>)</span>
<span id="cb12-9"><a href="#cb12-9"></a><span class="kw">import</span> <span class="dt">SimpleService.Server</span> (runServer)</span>
<span id="cb12-10"><a href="#cb12-10"></a></span>
<span id="cb12-11"><a href="#cb12-11"></a><span class="ot">main ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">Eff</span> (<span class="ot"> console ::</span> <span class="dt">CONSOLE</span></span>
<span id="cb12-12"><a href="#cb12-12"></a>                        ,<span class="ot"> express ::</span> <span class="dt">EXPRESS</span></span>
<span id="cb12-13"><a href="#cb12-13"></a>                        ,<span class="ot"> postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span></span>
<span id="cb12-14"><a href="#cb12-14"></a>                        <span class="op">|</span> eff) <span class="dt">Unit</span></span>
<span id="cb12-15"><a href="#cb12-15"></a>main <span class="ot">=</span> runServer port databaseConfig</span>
<span id="cb12-16"><a href="#cb12-16"></a>  <span class="kw">where</span></span>
<span id="cb12-17"><a href="#cb12-17"></a>    port <span class="ot">=</span> <span class="dv">4000</span></span>
<span id="cb12-18"><a href="#cb12-18"></a>    databaseConfig <span class="ot">=</span> { user<span class="op">:</span> <span class="st">&quot;abhinav&quot;</span></span>
<span id="cb12-19"><a href="#cb12-19"></a>                     , password<span class="op">:</span> <span class="st">&quot;&quot;</span></span>
<span id="cb12-20"><a href="#cb12-20"></a>                     , host<span class="op">:</span> <span class="st">&quot;localhost&quot;</span></span>
<span id="cb12-21"><a href="#cb12-21"></a>                     , port<span class="op">:</span> <span class="dv">5432</span></span>
<span id="cb12-22"><a href="#cb12-22"></a>                     , database<span class="op">:</span> <span class="st">&quot;simple_service&quot;</span></span>
<span id="cb12-23"><a href="#cb12-23"></a>                     , <span class="fu">max</span><span class="op">:</span> <span class="dv">10</span></span>
<span id="cb12-24"><a href="#cb12-24"></a>                     , idleTimeoutMillis<span class="op">:</span> <span class="dv">1000</span></span>
<span id="cb12-25"><a href="#cb12-25"></a>                     }</span></code></pre></div>
<p>Next, we wire up the server routes to the handlers in <code>src/SimpleService/Server.purs</code>:</p>
<div class="sourceCode" id="cb13"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb13-1"><a href="#cb13-1"></a><span class="kw">module</span> <span class="dt">SimpleService.Server</span> (runServer) <span class="kw">where</span></span>
<span id="cb13-2"><a href="#cb13-2"></a></span>
<span id="cb13-3"><a href="#cb13-3"></a><span class="kw">import</span> <span class="dt">Prelude</span></span>
<span id="cb13-4"><a href="#cb13-4"></a></span>
<span id="cb13-5"><a href="#cb13-5"></a><span class="kw">import</span> <span class="dt">Control.Monad.Aff</span> (runAff)</span>
<span id="cb13-6"><a href="#cb13-6"></a><span class="kw">import</span> <span class="dt">Control.Monad.Eff</span> (<span class="dt">Eff</span>)</span>
<span id="cb13-7"><a href="#cb13-7"></a><span class="kw">import</span> <span class="dt">Control.Monad.Eff.Class</span> (liftEff)</span>
<span id="cb13-8"><a href="#cb13-8"></a><span class="kw">import</span> <span class="dt">Control.Monad.Eff.Console</span> (<span class="dt">CONSOLE</span>, log, logShow)</span>
<span id="cb13-9"><a href="#cb13-9"></a><span class="kw">import</span> <span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span></span>
<span id="cb13-10"><a href="#cb13-10"></a><span class="kw">import</span> <span class="dt">Node.Express.App</span> (<span class="dt">App</span>, get, listenHttp)</span>
<span id="cb13-11"><a href="#cb13-11"></a><span class="kw">import</span> <span class="dt">Node.Express.Types</span> (<span class="dt">EXPRESS</span>)</span>
<span id="cb13-12"><a href="#cb13-12"></a><span class="kw">import</span> <span class="dt">SimpleService.Handler</span> (getUser)</span>
<span id="cb13-13"><a href="#cb13-13"></a></span>
<span id="cb13-14"><a href="#cb13-14"></a><span class="ot">app ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb13-15"><a href="#cb13-15"></a>app pool <span class="ot">=</span> <span class="kw">do</span></span>
<span id="cb13-16"><a href="#cb13-16"></a>  get <span class="st">&quot;/v1/user/:id&quot;</span> <span class="op">$</span> getUser pool</span>
<span id="cb13-17"><a href="#cb13-17"></a></span>
<span id="cb13-18"><a href="#cb13-18"></a><span class="ot">runServer ::</span> <span class="kw">forall</span> eff<span class="op">.</span></span>
<span id="cb13-19"><a href="#cb13-19"></a>             <span class="dt">Int</span></span>
<span id="cb13-20"><a href="#cb13-20"></a>          <span class="ot">-&gt;</span> <span class="dt">PG.PoolConfiguration</span></span>
<span id="cb13-21"><a href="#cb13-21"></a>          <span class="ot">-&gt;</span> <span class="dt">Eff</span> (<span class="ot"> express ::</span> <span class="dt">EXPRESS</span></span>
<span id="cb13-22"><a href="#cb13-22"></a>                 ,<span class="ot"> postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span></span>
<span id="cb13-23"><a href="#cb13-23"></a>                 ,<span class="ot"> console ::</span> <span class="dt">CONSOLE</span></span>
<span id="cb13-24"><a href="#cb13-24"></a>                 <span class="op">|</span> eff ) <span class="dt">Unit</span></span>
<span id="cb13-25"><a href="#cb13-25"></a>runServer port databaseConfig <span class="ot">=</span>  void <span class="op">$</span> runAff logShow <span class="fu">pure</span> <span class="kw">do</span></span>
<span id="cb13-26"><a href="#cb13-26"></a>  pool <span class="ot">&lt;-</span> PG.newPool databaseConfig</span>
<span id="cb13-27"><a href="#cb13-27"></a>  <span class="kw">let</span> app' <span class="ot">=</span> app pool</span>
<span id="cb13-28"><a href="#cb13-28"></a>  void <span class="op">$</span> liftEff <span class="op">$</span> listenHttp app' port \_ <span class="ot">-&gt;</span> <span class="fu">log</span> <span class="op">$</span> <span class="st">&quot;Server listening on :&quot;</span> <span class="op">&lt;&gt;</span> <span class="fu">show</span> port</span></code></pre></div>
<p><code>runServer</code> creates a PostgreSQL connection pool and passes it to the <code>app</code> function which creates the Express application, which in turn, binds it to the handler <code>getUser</code>. Then it launches the HTTP server by calling <code>listenHttp</code>.</p>
<p>Finally, we write the actual <code>getUser</code> handler in <code>src/SimpleService/Handler.purs</code>:</p>
<div class="sourceCode" id="cb14"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb14-1"><a href="#cb14-1"></a><span class="kw">module</span> <span class="dt">SimpleService.Handler</span> <span class="kw">where</span></span>
<span id="cb14-2"><a href="#cb14-2"></a></span>
<span id="cb14-3"><a href="#cb14-3"></a><span class="kw">import</span> <span class="dt">Prelude</span></span>
<span id="cb14-4"><a href="#cb14-4"></a></span>
<span id="cb14-5"><a href="#cb14-5"></a><span class="kw">import</span> <span class="dt">Control.Monad.Aff.Class</span> (liftAff)</span>
<span id="cb14-6"><a href="#cb14-6"></a><span class="kw">import</span> <span class="dt">Data.Foreign.Class</span> (encode)</span>
<span id="cb14-7"><a href="#cb14-7"></a><span class="kw">import</span> <span class="dt">Data.Int</span> (fromString)</span>
<span id="cb14-8"><a href="#cb14-8"></a><span class="kw">import</span> <span class="dt">Data.Maybe</span> (<span class="dt">Maybe</span>(..))</span>
<span id="cb14-9"><a href="#cb14-9"></a><span class="kw">import</span> <span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span></span>
<span id="cb14-10"><a href="#cb14-10"></a><span class="kw">import</span> <span class="dt">Node.Express.Handler</span> (<span class="dt">Handler</span>)</span>
<span id="cb14-11"><a href="#cb14-11"></a><span class="kw">import</span> <span class="dt">Node.Express.Request</span> (getRouteParam)</span>
<span id="cb14-12"><a href="#cb14-12"></a><span class="kw">import</span> <span class="dt">Node.Express.Response</span> (end, sendJson, setStatus)</span>
<span id="cb14-13"><a href="#cb14-13"></a><span class="kw">import</span> <span class="dt">SimpleService.Persistence</span> <span class="kw">as</span> <span class="dt">P</span></span>
<span id="cb14-14"><a href="#cb14-14"></a></span>
<span id="cb14-15"><a href="#cb14-15"></a><span class="ot">getUser ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb14-16"><a href="#cb14-16"></a>getUser pool <span class="ot">=</span> getRouteParam <span class="st">&quot;id&quot;</span> <span class="op">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span></span>
<span id="cb14-17"><a href="#cb14-17"></a>  <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User ID is required&quot;</span> }</span>
<span id="cb14-18"><a href="#cb14-18"></a>  <span class="dt">Just</span> sUserId <span class="ot">-&gt;</span> <span class="kw">case</span> fromString sUserId <span class="kw">of</span></span>
<span id="cb14-19"><a href="#cb14-19"></a>    <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User ID must be an integer: &quot;</span> <span class="op">&lt;&gt;</span> sUserId }</span>
<span id="cb14-20"><a href="#cb14-20"></a>    <span class="dt">Just</span> userId <span class="ot">-&gt;</span> liftAff (PG.withConnection pool <span class="op">$</span> <span class="fu">flip</span> P.findUser userId) <span class="op">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span></span>
<span id="cb14-21"><a href="#cb14-21"></a>      <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">404</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="op">&lt;&gt;</span> sUserId }</span>
<span id="cb14-22"><a href="#cb14-22"></a>      <span class="dt">Just</span> user <span class="ot">-&gt;</span> respond <span class="dv">200</span> (encode user)</span>
<span id="cb14-23"><a href="#cb14-23"></a></span>
<span id="cb14-24"><a href="#cb14-24"></a><span class="ot">respond ::</span> <span class="kw">forall</span> eff a<span class="op">.</span> <span class="dt">Int</span> <span class="ot">-&gt;</span> a <span class="ot">-&gt;</span> <span class="dt">Handler</span> eff</span>
<span id="cb14-25"><a href="#cb14-25"></a>respond status body <span class="ot">=</span> <span class="kw">do</span></span>
<span id="cb14-26"><a href="#cb14-26"></a>  setStatus status</span>
<span id="cb14-27"><a href="#cb14-27"></a>  sendJson body</span>
<span id="cb14-28"><a href="#cb14-28"></a></span>
<span id="cb14-29"><a href="#cb14-29"></a><span class="ot">respondNoContent ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">Int</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> eff</span>
<span id="cb14-30"><a href="#cb14-30"></a>respondNoContent status <span class="ot">=</span> <span class="kw">do</span></span>
<span id="cb14-31"><a href="#cb14-31"></a>  setStatus status</span>
<span id="cb14-32"><a href="#cb14-32"></a>  end</span></code></pre></div>
<p><code>getUser</code> validates the route parameter for valid user ID, sending error HTTP responses in case of failures. It then calls <code>findUser</code> to find the user and returns appropriate response.</p>
<p>We can test this on the command-line using <a href="https://httpie.org" target="_blank" rel="noopener">HTTPie</a>. We run <code>pulp --watch run</code> in one terminal to start the server with file watching, and test it from another terminal:</p>
<div class="sourceCode" id="cb15"><pre class="sourceCode bash"><code class="sourceCode bash"><span id="cb15-1"><a href="#cb15-1"></a>$ <span class="ex">pulp</span> --watch run</span>
<span id="cb15-2"><a href="#cb15-2"></a><span class="ex">*</span> Building project in ps-simple-rest-service</span>
<span id="cb15-3"><a href="#cb15-3"></a><span class="ex">*</span> Build successful.</span>
<span id="cb15-4"><a href="#cb15-4"></a><span class="ex">Server</span> listening on :4000</span></code></pre></div>
<pre class="http"><code>$ http GET https://localhost:4000/v1/user/1 # should return the user we created earlier
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
<pre class="http"><code>$ http GET https://localhost:4000/v1/user/s
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
<pre class="http"><code>$ http GET https://localhost:4000/v1/user/2
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
<div class="sourceCode" id="cb19"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb19-1"><a href="#cb19-1"></a><span class="co">-- previous code</span></span>
<span id="cb19-2"><a href="#cb19-2"></a><span class="kw">import</span> <span class="dt">Node.Express.App</span> (<span class="dt">App</span>, delete, get, listenHttp)</span>
<span id="cb19-3"><a href="#cb19-3"></a><span class="kw">import</span> <span class="dt">SimpleService.Handler</span> (deleteUser, getUser)</span>
<span id="cb19-4"><a href="#cb19-4"></a><span class="co">-- previous code</span></span>
<span id="cb19-5"><a href="#cb19-5"></a></span>
<span id="cb19-6"><a href="#cb19-6"></a><span class="ot">app ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb19-7"><a href="#cb19-7"></a>app pool <span class="ot">=</span> <span class="kw">do</span></span>
<span id="cb19-8"><a href="#cb19-8"></a>  get <span class="st">&quot;/v1/user/:id&quot;</span> <span class="op">$</span> getUser pool</span>
<span id="cb19-9"><a href="#cb19-9"></a>  delete <span class="st">&quot;/v1/user/:id&quot;</span> <span class="op">$</span> deleteUser pool</span>
<span id="cb19-10"><a href="#cb19-10"></a></span>
<span id="cb19-11"><a href="#cb19-11"></a><span class="co">-- previous code</span></span></code></pre></div>
<p>And we add the handler in the <code>src/SimpleService/Handler.purs</code> file:</p>
<div class="sourceCode" id="cb20"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb20-1"><a href="#cb20-1"></a><span class="ot">deleteUser ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb20-2"><a href="#cb20-2"></a>deleteUser pool <span class="ot">=</span> getRouteParam <span class="st">&quot;id&quot;</span> <span class="op">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span></span>
<span id="cb20-3"><a href="#cb20-3"></a>  <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User ID is required&quot;</span> }</span>
<span id="cb20-4"><a href="#cb20-4"></a>  <span class="dt">Just</span> sUserId <span class="ot">-&gt;</span> <span class="kw">case</span> fromString sUserId <span class="kw">of</span></span>
<span id="cb20-5"><a href="#cb20-5"></a>    <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User ID must be an integer: &quot;</span> <span class="op">&lt;&gt;</span> sUserId }</span>
<span id="cb20-6"><a href="#cb20-6"></a>    <span class="dt">Just</span> userId <span class="ot">-&gt;</span> <span class="kw">do</span></span>
<span id="cb20-7"><a href="#cb20-7"></a>      found <span class="ot">&lt;-</span> liftAff <span class="op">$</span> PG.withConnection pool \conn <span class="ot">-&gt;</span> PG.withTransaction conn <span class="kw">do</span></span>
<span id="cb20-8"><a href="#cb20-8"></a>        P.findUser conn userId <span class="op">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span></span>
<span id="cb20-9"><a href="#cb20-9"></a>          <span class="dt">Nothing</span> <span class="ot">-&gt;</span> <span class="fu">pure</span> false</span>
<span id="cb20-10"><a href="#cb20-10"></a>          <span class="dt">Just</span> _  <span class="ot">-&gt;</span> <span class="kw">do</span></span>
<span id="cb20-11"><a href="#cb20-11"></a>            P.deleteUser conn userId</span>
<span id="cb20-12"><a href="#cb20-12"></a>            <span class="fu">pure</span> true</span>
<span id="cb20-13"><a href="#cb20-13"></a>      <span class="kw">if</span> found</span>
<span id="cb20-14"><a href="#cb20-14"></a>        <span class="kw">then</span> respondNoContent <span class="dv">204</span></span>
<span id="cb20-15"><a href="#cb20-15"></a>        <span class="kw">else</span> respond <span class="dv">404</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="op">&lt;&gt;</span> sUserId }</span></code></pre></div>
<p>After the usual validations on the route param, <code>deleteUser</code> tries to find the user by the given user ID and if found, it deletes the user. Both the persistence related functions are run inside a single SQL transaction using <code>PG.withTransaction</code> function. <code>deleteUser</code> return 404 status if the user is not found, else it returns 204 status.</p>
<p>Let’s try it out:</p>
<pre class="http"><code>$ http GET https://localhost:4000/v1/user/1
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
<pre class="http"><code>$ http DELETE https://localhost:4000/v1/user/1
HTTP/1.1 204 No Content
Connection: keep-alive
Date: Mon, 11 Sep 2017 05:10:56 GMT
X-Powered-By: Express</code></pre>
<pre class="http"><code>$ http GET https://localhost:4000/v1/user/1
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
<pre class="http"><code>$ http DELETE https://localhost:4000/v1/user/1
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
<div class="page-break">

</div>
<h3 id="creating-a-user">Creating a User<a href="#creating-a-user" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h3>
<p><code>createUser</code> handler is a bit more involved. First, we add an Express middleware to parse the body of the request as JSON. We use <a href="https://github.com/expressjs/body-parser" target="_blank" rel="noopener"><code>body-parser</code></a> for this and access it through PureScript <a href="https://github.com/purescript/documentation/blob/master/guides/FFI.md" target="_blank" rel="noopener">FFI</a>. We create a new file <code>src/SimpleService/Middleware/BodyParser.js</code> with the content:</p>
<div class="sourceCode" id="cb25"><pre class="sourceCode javascript"><code class="sourceCode javascript"><span id="cb25-1"><a href="#cb25-1"></a><span class="st">&quot;use strict&quot;</span><span class="op">;</span></span>
<span id="cb25-2"><a href="#cb25-2"></a></span>
<span id="cb25-3"><a href="#cb25-3"></a><span class="kw">var</span> bodyParser <span class="op">=</span> <span class="at">require</span>(<span class="st">&quot;body-parser&quot;</span>)<span class="op">;</span></span>
<span id="cb25-4"><a href="#cb25-4"></a></span>
<span id="cb25-5"><a href="#cb25-5"></a><span class="va">exports</span>.<span class="at">jsonBodyParser</span> <span class="op">=</span> <span class="va">bodyParser</span>.<span class="at">json</span>(<span class="op">{</span></span>
<span id="cb25-6"><a href="#cb25-6"></a>  <span class="dt">limit</span><span class="op">:</span> <span class="st">&quot;5mb&quot;</span></span>
<span id="cb25-7"><a href="#cb25-7"></a><span class="op">}</span>)<span class="op">;</span></span></code></pre></div>
<p>And write a wrapper for it in the file <code>src/SimpleService/Middleware/BodyParser.purs</code> with the content:</p>
<div class="sourceCode" id="cb26"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb26-1"><a href="#cb26-1"></a><span class="kw">module</span> <span class="dt">SimpleService.Middleware.BodyParser</span> <span class="kw">where</span></span>
<span id="cb26-2"><a href="#cb26-2"></a></span>
<span id="cb26-3"><a href="#cb26-3"></a><span class="kw">import</span> <span class="dt">Prelude</span></span>
<span id="cb26-4"><a href="#cb26-4"></a><span class="kw">import</span> <span class="dt">Data.Function.Uncurried</span> (<span class="dt">Fn3</span>)</span>
<span id="cb26-5"><a href="#cb26-5"></a><span class="kw">import</span> <span class="dt">Node.Express.Types</span> (<span class="dt">ExpressM</span>, <span class="dt">Response</span>, <span class="dt">Request</span>)</span>
<span id="cb26-6"><a href="#cb26-6"></a></span>
<span id="cb26-7"><a href="#cb26-7"></a>foreign <span class="kw">import</span> jsonBodyParser ::</span>
<span id="cb26-8"><a href="#cb26-8"></a>  <span class="kw">forall</span> e<span class="op">.</span> <span class="dt">Fn3</span> <span class="dt">Request</span> <span class="dt">Response</span> (<span class="dt">ExpressM</span> e <span class="dt">Unit</span>) (<span class="dt">ExpressM</span> e <span class="dt">Unit</span>)</span></code></pre></div>
<p>We also install the <code>body-parser</code> npm dependency:</p>
<div class="sourceCode" id="cb27"><pre class="sourceCode bash"><code class="sourceCode bash"><span id="cb27-1"><a href="#cb27-1"></a>$ <span class="ex">npm</span> install --save body-parser</span></code></pre></div>
<p>Next, we change the <code>app</code> function in the <code>src/SimpleService/Server.purs</code> file to add the middleware and the route:</p>
<div class="sourceCode" id="cb28"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb28-1"><a href="#cb28-1"></a><span class="co">-- previous code</span></span>
<span id="cb28-2"><a href="#cb28-2"></a><span class="kw">import</span> <span class="dt">Node.Express.App</span> (<span class="dt">App</span>, delete, get, listenHttp, post, useExternal)</span>
<span id="cb28-3"><a href="#cb28-3"></a><span class="kw">import</span> <span class="dt">SimpleService.Handler</span> (createUser, deleteUser, getUser)</span>
<span id="cb28-4"><a href="#cb28-4"></a><span class="kw">import</span> <span class="dt">SimpleService.Middleware.BodyParser</span> (jsonBodyParser)</span>
<span id="cb28-5"><a href="#cb28-5"></a><span class="co">-- previous code</span></span>
<span id="cb28-6"><a href="#cb28-6"></a></span>
<span id="cb28-7"><a href="#cb28-7"></a><span class="ot">app ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb28-8"><a href="#cb28-8"></a>app pool <span class="ot">=</span> <span class="kw">do</span></span>
<span id="cb28-9"><a href="#cb28-9"></a>  useExternal jsonBodyParser</span>
<span id="cb28-10"><a href="#cb28-10"></a></span>
<span id="cb28-11"><a href="#cb28-11"></a>  get <span class="st">&quot;/v1/user/:id&quot;</span> <span class="op">$</span> getUser pool</span>
<span id="cb28-12"><a href="#cb28-12"></a>  delete <span class="st">&quot;/v1/user/:id&quot;</span> <span class="op">$</span> deleteUser pool</span>
<span id="cb28-13"><a href="#cb28-13"></a>  post <span class="st">&quot;/v1/users&quot;</span> <span class="op">$</span> createUser pool</span></code></pre></div>
<p>And finally, we write the handler in the <code>src/SimpleService/Handler.purs</code> file:</p>
<div class="sourceCode" id="cb29"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb29-1"><a href="#cb29-1"></a><span class="co">-- previous code</span></span>
<span id="cb29-2"><a href="#cb29-2"></a><span class="kw">import</span> <span class="dt">Data.Either</span> (<span class="dt">Either</span>(..))</span>
<span id="cb29-3"><a href="#cb29-3"></a><span class="kw">import</span> <span class="dt">Data.Foldable</span> (intercalate)</span>
<span id="cb29-4"><a href="#cb29-4"></a><span class="kw">import</span> <span class="dt">Data.Foreign</span> (renderForeignError)</span>
<span id="cb29-5"><a href="#cb29-5"></a><span class="kw">import</span> <span class="dt">Node.Express.Request</span> (getBody, getRouteParam)</span>
<span id="cb29-6"><a href="#cb29-6"></a><span class="kw">import</span> <span class="dt">SimpleService.Types</span></span>
<span id="cb29-7"><a href="#cb29-7"></a><span class="co">-- previous code</span></span>
<span id="cb29-8"><a href="#cb29-8"></a></span>
<span id="cb29-9"><a href="#cb29-9"></a><span class="ot">createUser ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb29-10"><a href="#cb29-10"></a>createUser pool <span class="ot">=</span> getBody <span class="op">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span></span>
<span id="cb29-11"><a href="#cb29-11"></a>  <span class="dt">Left</span> errs <span class="ot">-&gt;</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> intercalate <span class="st">&quot;, &quot;</span> <span class="op">$</span> <span class="fu">map</span> renderForeignError errs}</span>
<span id="cb29-12"><a href="#cb29-12"></a>  <span class="dt">Right</span> u<span class="op">@</span>(<span class="dt">User</span> user) <span class="ot">-&gt;</span></span>
<span id="cb29-13"><a href="#cb29-13"></a>    <span class="kw">if</span> user<span class="op">.</span><span class="fu">id</span> <span class="op">&lt;=</span> <span class="dv">0</span></span>
<span id="cb29-14"><a href="#cb29-14"></a>      <span class="kw">then</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User ID must be positive: &quot;</span> <span class="op">&lt;&gt;</span> <span class="fu">show</span> user<span class="op">.</span><span class="fu">id</span>}</span>
<span id="cb29-15"><a href="#cb29-15"></a>      <span class="kw">else</span> <span class="kw">if</span> user<span class="op">.</span>name <span class="op">==</span> <span class="st">&quot;&quot;</span></span>
<span id="cb29-16"><a href="#cb29-16"></a>        <span class="kw">then</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User name must not be empty&quot;</span> }</span>
<span id="cb29-17"><a href="#cb29-17"></a>        <span class="kw">else</span> <span class="kw">do</span></span>
<span id="cb29-18"><a href="#cb29-18"></a>          liftAff (PG.withConnection pool <span class="op">$</span> <span class="fu">flip</span> P.insertUser u)</span>
<span id="cb29-19"><a href="#cb29-19"></a>          respondNoContent <span class="dv">201</span></span></code></pre></div>
<p><code>createUser</code> calls <a href="https://pursuit.purescript.org/packages/purescript-express/0.5.2/docs/Node.Express.Request#v:getBody" target="_blank" rel="noopener"><code>getBody</code></a> which has type signature <code>forall e a. (Decode a) =&gt; HandlerM (express :: EXPRESS | e) (Either MultipleErrors a)</code>. It returns either a list of parsing errors or a parsed instance, which in our case is a <code>User</code>. In case of errors, we just return the errors rendered as string with a 422 status. If we get a parsed <code>User</code> instance, we do some validations on it, returning appropriate error messages. If all validations pass, we create the user in the database by calling <code>insertUser</code> from the persistence layer and respond with a status 201.</p>
<p>We can try it out:</p>
<pre class="http"><code>$ http POST https://localhost:4000/v1/users name=&quot;abhinav&quot;
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
<pre class="http"><code>$ http POST https://localhost:4000/v1/users id:=1 name=&quot;&quot;
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
<pre class="http"><code>$ http POST https://localhost:4000/v1/users id:=1 name=&quot;abhinav&quot;
HTTP/1.1 201 Created
Connection: keep-alive
Content-Length: 0
Date: Mon, 11 Sep 2017 05:52:23 GMT
X-Powered-By: Express</code></pre>
<pre class="http"><code>$ http GET https://localhost:4000/v1/user/1
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
<p>First try returns a parsing failure because we didn’t provide the <code>id</code> field. Second try is a validation failure because the name was empty. Third try is a success which we confirm by doing a <code>GET</code> request next.</p>
<h3 id="updating-a-user">Updating a User<a href="#updating-a-user" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h3>
<p>We want to allow a user’s name to be updated through the API, but not the user’s ID. So we add a new type to <code>src/SimpleService/Types.purs</code> to represent a possible change in user’s name:</p>
<div class="sourceCode" id="cb34"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb34-1"><a href="#cb34-1"></a><span class="co">-- previous code</span></span>
<span id="cb34-2"><a href="#cb34-2"></a><span class="kw">import</span> <span class="dt">Data.Foreign.NullOrUndefined</span> (<span class="dt">NullOrUndefined</span>)</span>
<span id="cb34-3"><a href="#cb34-3"></a><span class="co">-- previous code</span></span>
<span id="cb34-4"><a href="#cb34-4"></a></span>
<span id="cb34-5"><a href="#cb34-5"></a><span class="kw">newtype</span> <span class="dt">UserPatch</span> <span class="ot">=</span> <span class="dt">UserPatch</span> {<span class="ot"> name ::</span> <span class="dt">NullOrUndefined</span> <span class="dt">String</span> }</span>
<span id="cb34-6"><a href="#cb34-6"></a></span>
<span id="cb34-7"><a href="#cb34-7"></a>derive <span class="kw">instance</span><span class="ot"> genericUserPatch ::</span> <span class="dt">Generic</span> <span class="dt">UserPatch</span> _</span>
<span id="cb34-8"><a href="#cb34-8"></a></span>
<span id="cb34-9"><a href="#cb34-9"></a><span class="kw">instance</span><span class="ot"> decodeUserPatch ::</span> <span class="dt">Decode</span> <span class="dt">UserPatch</span> <span class="kw">where</span></span>
<span id="cb34-10"><a href="#cb34-10"></a>  decode <span class="ot">=</span> genericDecode <span class="op">$</span> defaultOptions { unwrapSingleConstructors <span class="ot">=</span> true }</span></code></pre></div>
<p><a href="https://pursuit.purescript.org/packages/purescript-foreign-generic/4.3.0/docs/Data.Foreign.NullOrUndefined#t:NullOrUndefined" target="_blank" rel="noopener"><code>NullOrUndefined</code></a> is a wrapper over <code>Maybe</code> with added support for Javascript <code>null</code> and <code>undefined</code> values. We define <code>UserPatch</code> as having a possibly null (or undefined) <code>name</code> field.</p>
<p>Now we can add the corresponding handler in <code>src/SimpleService/Handlers.purs</code>:</p>
<div class="sourceCode" id="cb35"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb35-1"><a href="#cb35-1"></a><span class="co">-- previous code</span></span>
<span id="cb35-2"><a href="#cb35-2"></a><span class="kw">import</span> <span class="dt">Data.Foreign.NullOrUndefined</span> (unNullOrUndefined)</span>
<span id="cb35-3"><a href="#cb35-3"></a><span class="co">-- previous code</span></span>
<span id="cb35-4"><a href="#cb35-4"></a></span>
<span id="cb35-5"><a href="#cb35-5"></a><span class="ot">updateUser ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb35-6"><a href="#cb35-6"></a>updateUser pool <span class="ot">=</span> getRouteParam <span class="st">&quot;id&quot;</span> <span class="op">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span></span>
<span id="cb35-7"><a href="#cb35-7"></a>  <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User ID is required&quot;</span> }</span>
<span id="cb35-8"><a href="#cb35-8"></a>  <span class="dt">Just</span> sUserId <span class="ot">-&gt;</span> <span class="kw">case</span> fromString sUserId <span class="kw">of</span></span>
<span id="cb35-9"><a href="#cb35-9"></a>    <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User ID must be positive: &quot;</span> <span class="op">&lt;&gt;</span> sUserId }</span>
<span id="cb35-10"><a href="#cb35-10"></a>    <span class="dt">Just</span> userId <span class="ot">-&gt;</span> getBody <span class="op">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span></span>
<span id="cb35-11"><a href="#cb35-11"></a>      <span class="dt">Left</span> errs <span class="ot">-&gt;</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> intercalate <span class="st">&quot;, &quot;</span> <span class="op">$</span> <span class="fu">map</span> renderForeignError errs}</span>
<span id="cb35-12"><a href="#cb35-12"></a>      <span class="dt">Right</span> (<span class="dt">UserPatch</span> userPatch) <span class="ot">-&gt;</span> <span class="kw">case</span> unNullOrUndefined userPatch<span class="op">.</span>name <span class="kw">of</span></span>
<span id="cb35-13"><a href="#cb35-13"></a>        <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respondNoContent <span class="dv">204</span></span>
<span id="cb35-14"><a href="#cb35-14"></a>        <span class="dt">Just</span> userName <span class="ot">-&gt;</span> <span class="kw">if</span> userName <span class="op">==</span> <span class="st">&quot;&quot;</span></span>
<span id="cb35-15"><a href="#cb35-15"></a>          <span class="kw">then</span> respond <span class="dv">422</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User name must not be empty&quot;</span> }</span>
<span id="cb35-16"><a href="#cb35-16"></a>          <span class="kw">else</span> <span class="kw">do</span></span>
<span id="cb35-17"><a href="#cb35-17"></a>            savedUser <span class="ot">&lt;-</span> liftAff <span class="op">$</span> PG.withConnection pool \conn <span class="ot">-&gt;</span> PG.withTransaction conn <span class="kw">do</span></span>
<span id="cb35-18"><a href="#cb35-18"></a>              P.findUser conn userId <span class="op">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span></span>
<span id="cb35-19"><a href="#cb35-19"></a>                <span class="dt">Nothing</span> <span class="ot">-&gt;</span> <span class="fu">pure</span> <span class="dt">Nothing</span></span>
<span id="cb35-20"><a href="#cb35-20"></a>                <span class="dt">Just</span> (<span class="dt">User</span> user) <span class="ot">-&gt;</span> <span class="kw">do</span></span>
<span id="cb35-21"><a href="#cb35-21"></a>                  <span class="kw">let</span> user' <span class="ot">=</span> <span class="dt">User</span> (user { name <span class="ot">=</span> userName })</span>
<span id="cb35-22"><a href="#cb35-22"></a>                  P.updateUser conn user'</span>
<span id="cb35-23"><a href="#cb35-23"></a>                  <span class="fu">pure</span> <span class="op">$</span> <span class="dt">Just</span> user'</span>
<span id="cb35-24"><a href="#cb35-24"></a>            <span class="kw">case</span> savedUser <span class="kw">of</span></span>
<span id="cb35-25"><a href="#cb35-25"></a>              <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">404</span> { <span class="fu">error</span><span class="op">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="op">&lt;&gt;</span> sUserId }</span>
<span id="cb35-26"><a href="#cb35-26"></a>              <span class="dt">Just</span> user <span class="ot">-&gt;</span> respond <span class="dv">200</span> (encode user)</span></code></pre></div>
<p>After checking for a valid user ID as before, we get the decoded request body as a <code>UserPatch</code> instance. If the path does not have the <code>name</code> field or has it as <code>null</code>, there is nothing to do and we respond with a 204 status. If the user’s name is present in the patch, we validate it for non-emptiness. Then, within a database transaction, we try to find the user with the given ID, responding with a 404 status if the user is not found. If the user is found, we update the user’s name in the database, and respond with a 200 status and the saved user encoded as the JSON response body.</p>
<p>Finally, we can add the route to our server’s router in <code>src/SimpleService/Server.purs</code> to make the functionality available:</p>
<div class="sourceCode" id="cb36"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb36-1"><a href="#cb36-1"></a><span class="co">-- previous code</span></span>
<span id="cb36-2"><a href="#cb36-2"></a><span class="kw">import</span> <span class="dt">Node.Express.App</span> (<span class="dt">App</span>, delete, get, http, listenHttp, post, useExternal)</span>
<span id="cb36-3"><a href="#cb36-3"></a><span class="kw">import</span> <span class="dt">Node.Express.Types</span> (<span class="dt">EXPRESS</span>, <span class="dt">Method</span>(..))</span>
<span id="cb36-4"><a href="#cb36-4"></a><span class="kw">import</span> <span class="dt">SimpleService.Handler</span> (createUser, deleteUser, getUser, updateUser)</span>
<span id="cb36-5"><a href="#cb36-5"></a><span class="co">-- previous code</span></span>
<span id="cb36-6"><a href="#cb36-6"></a></span>
<span id="cb36-7"><a href="#cb36-7"></a><span class="ot">app ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb36-8"><a href="#cb36-8"></a>app pool <span class="ot">=</span> <span class="kw">do</span></span>
<span id="cb36-9"><a href="#cb36-9"></a>  useExternal jsonBodyParser</span>
<span id="cb36-10"><a href="#cb36-10"></a></span>
<span id="cb36-11"><a href="#cb36-11"></a>  get <span class="st">&quot;/v1/user/:id&quot;</span>    <span class="op">$</span> getUser pool</span>
<span id="cb36-12"><a href="#cb36-12"></a>  delete <span class="st">&quot;/v1/user/:id&quot;</span> <span class="op">$</span> deleteUser pool</span>
<span id="cb36-13"><a href="#cb36-13"></a>  post <span class="st">&quot;/v1/users&quot;</span>      <span class="op">$</span> createUser pool</span>
<span id="cb36-14"><a href="#cb36-14"></a>  patch <span class="st">&quot;/v1/user/:id&quot;</span>  <span class="op">$</span> updateUser pool</span>
<span id="cb36-15"><a href="#cb36-15"></a>  <span class="kw">where</span></span>
<span id="cb36-16"><a href="#cb36-16"></a>    patch <span class="ot">=</span> http (<span class="dt">CustomMethod</span> <span class="st">&quot;patch&quot;</span>)</span></code></pre></div>
<p>We can try it out now:</p>
<pre class="http"><code>$ http GET https://localhost:4000/v1/user/1
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
<pre class="http"><code>$ http PATCH https://localhost:4000/v1/user/1 name=abhinavsarkar
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
<pre class="http"><code>$ http GET https://localhost:4000/v1/user/1
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
<pre class="http"><code>$ http PATCH https://localhost:4000/v1/user/1
HTTP/1.1 204 No Content
Connection: keep-alive
Date: Fri, 11 Sep 2017 06:42:31 GMT
X-Powered-By: Express</code></pre>
<pre class="http"><code>$ http PATCH https://localhost:4000/v1/user/1 name=&quot;&quot;
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
<div class="page-break">

</div>
<h3 id="listing-all-users">Listing all Users<a href="#listing-all-users" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h3>
<p>Listing all users is quite simple since it doesn’t require us to take any request parameter.</p>
<p>We add the handler to the <code>src/SimpleService/Handler.purs</code> file:</p>
<div class="sourceCode" id="cb42"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb42-1"><a href="#cb42-1"></a><span class="co">-- previous code</span></span>
<span id="cb42-2"><a href="#cb42-2"></a><span class="ot">listUsers ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb42-3"><a href="#cb42-3"></a>listUsers pool <span class="ot">=</span> liftAff (PG.withConnection pool P.listUsers) <span class="op">&gt;&gt;=</span> encode <span class="op">&gt;&gt;&gt;</span> respond <span class="dv">200</span></span></code></pre></div>
<p>And the route to the <code>src/SimpleService/Server.purs</code> file:</p>
<div class="sourceCode" id="cb43"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span id="cb43-1"><a href="#cb43-1"></a><span class="co">-- previous code</span></span>
<span id="cb43-2"><a href="#cb43-2"></a><span class="kw">import</span> <span class="dt">SimpleService.Handler</span> (createUser, deleteUser, getUser, listUsers, updateUser)</span>
<span id="cb43-3"><a href="#cb43-3"></a><span class="co">-- previous code</span></span>
<span id="cb43-4"><a href="#cb43-4"></a></span>
<span id="cb43-5"><a href="#cb43-5"></a><span class="ot">app ::</span> <span class="kw">forall</span> eff<span class="op">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="op">|</span> eff)</span>
<span id="cb43-6"><a href="#cb43-6"></a>app pool <span class="ot">=</span> <span class="kw">do</span></span>
<span id="cb43-7"><a href="#cb43-7"></a>  useExternal jsonBodyParser</span>
<span id="cb43-8"><a href="#cb43-8"></a></span>
<span id="cb43-9"><a href="#cb43-9"></a>  get <span class="st">&quot;/v1/user/:id&quot;</span>    <span class="op">$</span> getUser pool</span>
<span id="cb43-10"><a href="#cb43-10"></a>  delete <span class="st">&quot;/v1/user/:id&quot;</span> <span class="op">$</span> deleteUser pool</span>
<span id="cb43-11"><a href="#cb43-11"></a>  post <span class="st">&quot;/v1/users&quot;</span>      <span class="op">$</span> createUser pool</span>
<span id="cb43-12"><a href="#cb43-12"></a>  patch <span class="st">&quot;/v1/user/:id&quot;</span>  <span class="op">$</span> updateUser pool</span>
<span id="cb43-13"><a href="#cb43-13"></a>  get <span class="st">&quot;/v1/users&quot;</span>       <span class="op">$</span> listUsers pool</span>
<span id="cb43-14"><a href="#cb43-14"></a>  <span class="kw">where</span></span>
<span id="cb43-15"><a href="#cb43-15"></a>    patch <span class="ot">=</span> http (<span class="dt">CustomMethod</span> <span class="st">&quot;patch&quot;</span>)</span></code></pre></div>
<p>And that’s it. We can test this endpoint:</p>
<pre class="http"><code>$ http POST https://localhost:4000/v1/users id:=2 name=sarkarabhinav
HTTP/1.1 201 Created
Connection: keep-alive
Content-Length: 0
Date: Fri, 11 Sep 2017 07:06:24 GMT
X-Powered-By: Express</code></pre>
<pre class="http"><code>$ http GET https://localhost:4000/v1/users
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
<h2 id="conclusion" data-track-content data-content-name="conclusion" data-content-piece="ps-simple-rest-service">Conclusion<a href="#conclusion" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>That concludes the first part of the two-part tutorial. We learned how to set up a PureScript project, how to access a Postgres database and how to create a JSON REST API over the database. The code till the end of this part can be found in <a href="https://github.com/abhin4v/ps-simple-rest-service/tree/9fdfe3a15508a3c29bd4bc96310fcf52b1022678" target="_blank" rel="noopener">github</a>. In the <a href="https://abhinavsarkar.net/posts/ps-simple-rest-service-2/">next</a> part, we’ll learn how to do API validation, application configuration and logging. Discuss this post in the <a href="https://abhinavsarkar.net/posts/ps-simple-rest-service/#comment-container">comments</a>.</p><p>If you liked this post, please <a href="https://abhinavsarkar.net/posts/ps-simple-rest-service/#comment-container">leave a comment</a>.</p><img src="https://anna.abhinavsarkar.net/piwik.php?idsite=1&amp;rec=1" style="border:0; display: none;" />
