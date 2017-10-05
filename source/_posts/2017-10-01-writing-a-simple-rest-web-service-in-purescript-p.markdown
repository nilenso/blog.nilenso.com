---
title: "Writing a Simple REST Web Service in Purescript - Part 2"
kind: article
created_at: 2017-10-01 00:00:00 UTC
author: Abhinav Sarkar
layout: post
---
<div class="ert">
21 minute read
</div>
<p>To recap, in the <a href="https://abhinavsarkar.net/posts/ps-simple-rest-service/">first</a> part of this two-part tutorial, we built a simple JSON <a href="https://en.wikipedia.org/wiki/REST" target="_blank" rel="noopener">REST</a> web service in <a href="http://purescript.org" target="_blank" rel="noopener">Purescript</a> to create, update, get, list and delete users, backed by a Postgres database. In this part we’ll work on the rest of the requirements:</p>
<ol type="1">
<li>validation of API requests.</li>
<li>reading the server and database configs from environment variables.</li>
<li>logging HTTP requests and debugging info.</li>
</ol>
<!--more-->
<nav id="toc" class="right-toc"><h3>Contents</h3><ol><li><a href="#bugs">Bugs!</a></li><li><a href="#validation">Validation</a></li><li><a href="#configuration">Configuration</a></li><li><a href="#logging">Logging</a></li><li><a href="#conclusion">Conclusion</a></li></ol></nav>
<p>But first,</p>
<h2 id="bugs">Bugs!<a href="#bugs" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>What happens if we hit a URL on our server which does not exist? Let’s fire up the server and test it:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">pulp</span> --watch run</code></pre></div>
<pre class="http"><code>$ http GET http://localhost:4000/v1/random
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 148
Content-Security-Policy: default-src 'self'
Content-Type: text/html; charset=utf-8
Date: Sat, 30 Sep 2017 08:23:20 GMT
X-Content-Type-Options: nosniff
X-Powered-By: Express

&lt;!DOCTYPE html&gt;
&lt;html lang=&quot;en&quot;&gt;
&lt;head&gt;
&lt;meta charset=&quot;utf-8&quot;&gt;
&lt;title&gt;Error&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;pre&gt;Cannot GET /v1/random&lt;/pre&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
<p>We get back a default HTML response with a 404 status from <a href="https://expressjs.com" target="_blank" rel="noopener">Express</a>. Since we are writing a JSON API, we should return a JSON response in this case too. We add the following code in the <code>src/SimpleService/Server.purs</code> file to add a catch-all route and send a 404 status with a JSON error message:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Data.Either</span> (fromRight)
<span class="kw">import </span><span class="dt">Data.String.Regex</span> (<span class="dt">Regex</span>, regex) <span class="kw">as</span> <span class="dt">Re</span>
<span class="kw">import </span><span class="dt">Data.String.Regex.Flags</span> (noFlags) <span class="kw">as</span> <span class="dt">Re</span>
<span class="kw">import </span><span class="dt">Node.Express.App</span> (<span class="dt">App</span>, all, delete, get, http, listenHttp, post, useExternal)
<span class="kw">import </span><span class="dt">Node.Express.Response</span> (sendJson, setStatus)
<span class="kw">import </span><span class="dt">Partial.Unsafe</span> (unsafePartial)
<span class="co">-- previous code</span>

<span class="ot">allRoutePattern ::</span> <span class="dt">Re.Regex</span>
allRoutePattern <span class="fu">=</span> unsafePartial <span class="fu">$</span> fromRight <span class="fu">$</span> Re.regex <span class="st">&quot;/.*&quot;</span> Re.noFlags

<span class="ot">app ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
app pool <span class="fu">=</span> <span class="kw">do</span>
  useExternal jsonBodyParser

  get <span class="st">&quot;/v1/user/:id&quot;</span>    <span class="fu">$</span> getUser pool
  delete <span class="st">&quot;/v1/user/:id&quot;</span> <span class="fu">$</span> deleteUser pool
  post <span class="st">&quot;/v1/users&quot;</span>      <span class="fu">$</span> createUser pool
  patch <span class="st">&quot;/v1/user/:id&quot;</span>  <span class="fu">$</span> updateUser pool
  get <span class="st">&quot;/v1/users&quot;</span>       <span class="fu">$</span> listUsers pool

  all allRoutePattern <span class="kw">do</span>
    setStatus <span class="dv">404</span>
    sendJson {error<span class="fu">:</span> <span class="st">&quot;Route not found&quot;</span>}
  <span class="kw">where</span>
    patch <span class="fu">=</span> http (<span class="dt">CustomMethod</span> <span class="st">&quot;patch&quot;</span>)</code></pre></div>
<p><code>allRoutePattern</code> matches all routes because it uses a <code>&quot;/.*&quot;</code> <a href="https://en.wikipedia.org/wiki/Regular_expression" target="_blank" rel="noopener">regular expression</a>. We place it as the last route to match all the otherwise unrouted requests. Let’s see what is the result:</p>
<pre class="http"><code>$ http GET http://localhost:4000/v1/random
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 27
Content-Type: application/json; charset=utf-8
Date: Sat, 30 Sep 2017 08:46:46 GMT
ETag: W/&quot;1b-772e0u4nrE48ogbR0KmKfSvrHUE&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;Route not found&quot;
}</code></pre>
<p>Now we get a nicely formatted JSON response.</p>
<p>Another scenario is when our application throws some uncaught error. To simulate this, we shut down our postgres database and hit the server for listing users:</p>
<pre class="http"><code>$ http GET http://localhost:4000/v1/users
HTTP/1.1 500 Internal Server Error
Connection: keep-alive
Content-Length: 372
Content-Security-Policy: default-src 'self'
Content-Type: text/html; charset=utf-8
Date: Sat, 30 Sep 2017 08:53:40 GMT
X-Content-Type-Options: nosniff
X-Powered-By: Express

&lt;!DOCTYPE html&gt;
&lt;html lang=&quot;en&quot;&gt;
&lt;head&gt;
&lt;meta charset=&quot;utf-8&quot;&gt;
&lt;title&gt;Error&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;pre&gt;Error: connect ECONNREFUSED 127.0.0.1:5432&lt;br&gt; &amp;nbsp; &amp;nbsp;at Object._errnoException (util.js:1026:11)&lt;br&gt; &amp;nbsp; &amp;nbsp;at _exceptionWithHostPort (util.js:1049:20)&lt;br&gt; &amp;nbsp; &amp;nbsp;at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1174:14)&lt;/pre&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
<p>We get another default HTML response from Express with a 500 status. Again, in this case we’d like to return a JSON response. We add the following code to the <code>src/SimpleService/Server.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Exception</span> (message)
<span class="kw">import </span><span class="dt">Node.Express.App</span> (<span class="dt">App</span>, all, delete, get, http, listenHttp, post, useExternal, useOnError)
<span class="co">-- previous code</span>

<span class="ot">app ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
app pool <span class="fu">=</span> <span class="kw">do</span>
  <span class="co">-- previous code</span>
  useOnError \err <span class="ot">-&gt;</span> <span class="kw">do</span>
    setStatus <span class="dv">500</span>
    sendJson {error<span class="fu">:</span> message err}
  <span class="kw">where</span>
    patch <span class="fu">=</span> http (<span class="dt">CustomMethod</span> <span class="st">&quot;patch&quot;</span>)</code></pre></div>
<p>We add the <code>useOnError</code> handler which comes with <a href="https://pursuit.purescript.org/packages/purescript-express" target="_blank" rel="noopener"><code>purescript-express</code></a> to return the error message as a JSON response. Back on the command-line:</p>
<pre class="http"><code>$ http GET http://localhost:4000/v1/users
HTTP/1.1 500 Internal Server Error
Connection: keep-alive
Content-Length: 47
Content-Type: application/json; charset=utf-8
Date: Sat, 30 Sep 2017 09:01:37 GMT
ETag: W/&quot;2f-cJuIW6961YCpo9TWDSZ9VWHLGHE&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;connect ECONNREFUSED 127.0.0.1:5432&quot;
}</code></pre>
<p>It works! Bugs are fixed now. We proceed to add next features.</p>
<h2 id="validation">Validation<a href="#validation" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>Let’s recall the code to update a user from the <code>src/SimpleService/Handler.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="ot">updateUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
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
<p>As we can see, the actual request handling logic is obfuscated by the request validation logic for the user id and the user name patch parameters. We also notice that we are using three constructs for validation here: <code>Maybe</code>, <code>Either</code> and <code>if-then-else</code>. However, we can use just <code>Either</code> to subsume all these cases as it can “carry” a failure as well as a success case. <code>Either</code> also comes with a nice monad transformer <a href="https://pursuit.purescript.org/packages/purescript-transformers/3.4.0/docs/Control.Monad.Except.Trans#t:ExceptT" target="_blank" rel="noopener"><code>ExceptT</code></a> which provides the <code>do</code> syntax for failure propagation. So we choose <code>ExceptT</code> as the base construct for our validation framework and write functions to upgrade <code>Maybe</code> and <code>if-then-else</code> to it. We add the following code to the <code>src/SimpleService/Validation.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">SimpleService.Validation</span>
  (<span class="kw">module</span> <span class="dt">MoreExports</span>, <span class="kw">module</span> <span class="dt">SimpleService.Validation</span>) <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Control.Monad.Except</span> (<span class="dt">ExceptT</span>, except, runExceptT)
<span class="kw">import </span><span class="dt">Data.Either</span> (<span class="dt">Either</span>(..))
<span class="kw">import </span><span class="dt">Data.Maybe</span> (<span class="dt">Maybe</span>(..))
<span class="kw">import </span><span class="dt">Node.Express.Handler</span> (<span class="dt">HandlerM</span>, <span class="dt">Handler</span>)
<span class="kw">import </span><span class="dt">Node.Express.Response</span> (sendJson, setStatus)
<span class="kw">import </span><span class="dt">Node.Express.Types</span> (<span class="dt">EXPRESS</span>)
<span class="kw">import </span><span class="dt">Control.Monad.Except</span> (except) <span class="kw">as</span> <span class="dt">MoreExports</span>

<span class="kw">type</span> <span class="dt">Validation</span> eff a <span class="fu">=</span> <span class="dt">ExceptT</span> <span class="dt">String</span> (<span class="dt">HandlerM</span> (<span class="ot">express ::</span> <span class="dt">EXPRESS</span> <span class="fu">|</span> eff)) a

<span class="ot">exceptMaybe ::</span> forall e m a<span class="fu">.</span> <span class="dt">Applicative</span> m <span class="ot">=&gt;</span> e <span class="ot">-&gt;</span> <span class="dt">Maybe</span> a <span class="ot">-&gt;</span> <span class="dt">ExceptT</span> e m a
exceptMaybe e a <span class="fu">=</span> except <span class="fu">$</span> <span class="kw">case</span> a <span class="kw">of</span>
  <span class="dt">Just</span> x  <span class="ot">-&gt;</span> <span class="dt">Right</span> x
  <span class="dt">Nothing</span> <span class="ot">-&gt;</span> <span class="dt">Left</span> e

<span class="ot">exceptCond ::</span> forall e m a<span class="fu">.</span> <span class="dt">Applicative</span> m <span class="ot">=&gt;</span> e <span class="ot">-&gt;</span> (a <span class="ot">-&gt;</span> <span class="dt">Boolean</span>) <span class="ot">-&gt;</span> a <span class="ot">-&gt;</span> <span class="dt">ExceptT</span> e m a
exceptCond e cond a <span class="fu">=</span> except <span class="fu">$</span> <span class="kw">if</span> cond a <span class="kw">then</span> <span class="dt">Right</span> a <span class="kw">else</span> <span class="dt">Left</span> e

<span class="ot">withValidation ::</span> forall eff a<span class="fu">.</span> <span class="dt">Validation</span> eff a <span class="ot">-&gt;</span> (a <span class="ot">-&gt;</span> <span class="dt">Handler</span> eff) <span class="ot">-&gt;</span> <span class="dt">Handler</span> eff
withValidation action handler <span class="fu">=</span> runExceptT action <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
  <span class="dt">Left</span> err <span class="ot">-&gt;</span> <span class="kw">do</span>
    setStatus <span class="dv">422</span>
    sendJson {error<span class="fu">:</span> err}
  <span class="dt">Right</span> x  <span class="ot">-&gt;</span> handler x</code></pre></div>
<p>We re-export <code>except</code> from the <code>Control.Monad.Except</code> module. We also add a <code>withValidation</code> function which runs an <code>ExceptT</code> based validation and either returns an error response with a 422 status in case of a failed validation or runs the given action with the valid value in case of a successful validation.</p>
<p>Using these functions, we now write <code>updateUser</code> in the <code>src/SimpleService/Handler.purs</code> file as:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Control.Monad.Trans.Class</span> (lift)
<span class="kw">import </span><span class="dt">Data.Bifunctor</span> (lmap)
<span class="kw">import </span><span class="dt">Data.Foreign</span> (<span class="dt">ForeignError</span>, renderForeignError)
<span class="kw">import </span><span class="dt">Data.List.NonEmpty</span> (toList)
<span class="kw">import </span><span class="dt">Data.List.Types</span> (<span class="dt">NonEmptyList</span>)
<span class="kw">import </span><span class="dt">Data.Tuple</span> (<span class="dt">Tuple</span>(..))
<span class="kw">import </span><span class="dt">SimpleService.Validation</span> <span class="kw">as</span> <span class="dt">V</span>
<span class="co">-- previous code</span>

<span class="ot">renderForeignErrors ::</span> forall a<span class="fu">.</span> <span class="dt">Either</span> (<span class="dt">NonEmptyList</span> <span class="dt">ForeignError</span>) a <span class="ot">-&gt;</span> <span class="dt">Either</span> <span class="dt">String</span> a
renderForeignErrors <span class="fu">=</span> lmap (toList <span class="fu">&gt;&gt;&gt;</span> map renderForeignError <span class="fu">&gt;&gt;&gt;</span> intercalate <span class="st">&quot;, &quot;</span>)

<span class="ot">updateUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
updateUser pool <span class="fu">=</span> V.withValidation (<span class="dt">Tuple</span> <span class="fu">&lt;$&gt;</span> getUserId <span class="fu">&lt;*&gt;</span> getUserPatch)
                                   \(<span class="dt">Tuple</span> userId (<span class="dt">UserPatch</span> userPatch)) <span class="ot">-&gt;</span>
    <span class="kw">case</span> unNullOrUndefined userPatch<span class="fu">.</span>name <span class="kw">of</span>
      <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respondNoContent <span class="dv">204</span>
      <span class="dt">Just</span> uName <span class="ot">-&gt;</span> V.withValidation (getUserName uName) \userName <span class="ot">-&gt;</span> <span class="kw">do</span>
        savedUser <span class="ot">&lt;-</span> liftAff <span class="fu">$</span> PG.withConnection pool \conn <span class="ot">-&gt;</span> PG.withTransaction conn <span class="kw">do</span>
          P.findUser conn userId <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
            <span class="dt">Nothing</span> <span class="ot">-&gt;</span> pure <span class="dt">Nothing</span>
            <span class="dt">Just</span> (<span class="dt">User</span> user) <span class="ot">-&gt;</span> <span class="kw">do</span>
              <span class="kw">let</span> user' <span class="fu">=</span> <span class="dt">User</span> (user { name <span class="fu">=</span> userName })
              P.updateUser conn user'
              pure <span class="fu">$</span> <span class="dt">Just</span> user'
        <span class="kw">case</span> savedUser <span class="kw">of</span>
          <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">404</span> { error<span class="fu">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="fu">&lt;&gt;</span> show userId }
          <span class="dt">Just</span> user <span class="ot">-&gt;</span> respond <span class="dv">200</span> (encode user)
  <span class="kw">where</span>
    getUserId <span class="fu">=</span> lift (getRouteParam <span class="st">&quot;id&quot;</span>)
      <span class="fu">&gt;&gt;=</span> V.exceptMaybe <span class="st">&quot;User ID is required&quot;</span>
      <span class="fu">&gt;&gt;=</span> fromString <span class="fu">&gt;&gt;&gt;</span> V.exceptMaybe <span class="st">&quot;User ID must be positive&quot;</span>

    getUserPatch <span class="fu">=</span> lift getBody <span class="fu">&gt;&gt;=</span> V.except <span class="fu">&lt;&lt;&lt;</span> renderForeignErrors

    getUserName <span class="fu">=</span> V.exceptCond <span class="st">&quot;User name must not be empty&quot;</span> (_ <span class="fu">==</span> <span class="st">&quot;&quot;</span>)</code></pre></div>
<p>The validation logic has been extracted out in separate functions now which are composed using <a href="https://pursuit.purescript.org/packages/purescript-prelude/3.0.0/docs/Control.Applicative#t:Applicative" target="_blank" rel="noopener">Applicative</a>. The validation steps are composed using the <code>ExceptT</code> monad. We are now free to express the core logic of the function clearly. We rewrite the <code>src/SimpleService/Handler.purs</code> file using the validations:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">SimpleService.Handler</span> <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Control.Monad.Aff.Class</span> (liftAff)
<span class="kw">import </span><span class="dt">Control.Monad.Trans.Class</span> (lift)
<span class="kw">import </span><span class="dt">Data.Bifunctor</span> (lmap)
<span class="kw">import </span><span class="dt">Data.Either</span> (<span class="dt">Either</span>)
<span class="kw">import </span><span class="dt">Data.Foldable</span> (intercalate)
<span class="kw">import </span><span class="dt">Data.Foreign</span> (<span class="dt">ForeignError</span>, renderForeignError)
<span class="kw">import </span><span class="dt">Data.Foreign.Class</span> (encode)
<span class="kw">import </span><span class="dt">Data.Foreign.NullOrUndefined</span> (unNullOrUndefined)
<span class="kw">import </span><span class="dt">Data.Int</span> (fromString)
<span class="kw">import </span><span class="dt">Data.List.NonEmpty</span> (toList)
<span class="kw">import </span><span class="dt">Data.List.Types</span> (<span class="dt">NonEmptyList</span>)
<span class="kw">import </span><span class="dt">Data.Maybe</span> (<span class="dt">Maybe</span>(..))
<span class="kw">import </span><span class="dt">Data.Tuple</span> (<span class="dt">Tuple</span>(..))
<span class="kw">import </span><span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span>
<span class="kw">import </span><span class="dt">Node.Express.Handler</span> (<span class="dt">Handler</span>)
<span class="kw">import </span><span class="dt">Node.Express.Request</span> (getBody, getRouteParam)
<span class="kw">import </span><span class="dt">Node.Express.Response</span> (end, sendJson, setStatus)
<span class="kw">import </span><span class="dt">SimpleService.Persistence</span> <span class="kw">as</span> <span class="dt">P</span>
<span class="kw">import </span><span class="dt">SimpleService.Validation</span> <span class="kw">as</span> <span class="dt">V</span>
<span class="kw">import </span><span class="dt">SimpleService.Types</span>

<span class="ot">getUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
getUser pool <span class="fu">=</span> V.withValidation getUserId \userId <span class="ot">-&gt;</span>
  liftAff (PG.withConnection pool <span class="fu">$</span> flip P.findUser userId) <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
    <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">404</span> { error<span class="fu">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="fu">&lt;&gt;</span> show userId }
    <span class="dt">Just</span> user <span class="ot">-&gt;</span> respond <span class="dv">200</span> (encode user)

<span class="ot">deleteUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
deleteUser pool <span class="fu">=</span> V.withValidation getUserId \userId <span class="ot">-&gt;</span> <span class="kw">do</span>
  found <span class="ot">&lt;-</span> liftAff <span class="fu">$</span> PG.withConnection pool \conn <span class="ot">-&gt;</span> PG.withTransaction conn <span class="kw">do</span>
    P.findUser conn userId <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
      <span class="dt">Nothing</span> <span class="ot">-&gt;</span> pure false
      <span class="dt">Just</span> _  <span class="ot">-&gt;</span> <span class="kw">do</span>
        P.deleteUser conn userId
        pure true
  <span class="kw">if</span> found
    <span class="kw">then</span> respondNoContent <span class="dv">204</span>
    <span class="kw">else</span> respond <span class="dv">404</span> { error<span class="fu">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="fu">&lt;&gt;</span> show userId }

<span class="ot">createUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
createUser pool <span class="fu">=</span> V.withValidation getUser \user<span class="fu">@</span>(<span class="dt">User</span> _) <span class="ot">-&gt;</span> <span class="kw">do</span>
  liftAff (PG.withConnection pool <span class="fu">$</span> flip P.insertUser user)
  respondNoContent <span class="dv">201</span>
  <span class="kw">where</span>
    getUser <span class="fu">=</span> lift getBody
      <span class="fu">&gt;&gt;=</span> V.except <span class="fu">&lt;&lt;&lt;</span> renderForeignErrors
      <span class="fu">&gt;&gt;=</span> V.exceptCond <span class="st">&quot;User ID must be positive&quot;</span> (\(<span class="dt">User</span> user) <span class="ot">-&gt;</span> user<span class="fu">.</span>id <span class="fu">&gt;</span> <span class="dv">0</span>)
      <span class="fu">&gt;&gt;=</span> V.exceptCond <span class="st">&quot;User name must not be empty&quot;</span> (\(<span class="dt">User</span> user) <span class="ot">-&gt;</span> user<span class="fu">.</span>name <span class="fu">/=</span> <span class="st">&quot;&quot;</span>)

<span class="ot">updateUser ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
updateUser pool <span class="fu">=</span> V.withValidation (<span class="dt">Tuple</span> <span class="fu">&lt;$&gt;</span> getUserId <span class="fu">&lt;*&gt;</span> getUserPatch)
                                   \(<span class="dt">Tuple</span> userId (<span class="dt">UserPatch</span> userPatch)) <span class="ot">-&gt;</span>
    <span class="kw">case</span> unNullOrUndefined userPatch<span class="fu">.</span>name <span class="kw">of</span>
      <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respondNoContent <span class="dv">204</span>
      <span class="dt">Just</span> uName <span class="ot">-&gt;</span> V.withValidation (getUserName uName) \userName <span class="ot">-&gt;</span> <span class="kw">do</span>
        savedUser <span class="ot">&lt;-</span> liftAff <span class="fu">$</span> PG.withConnection pool \conn <span class="ot">-&gt;</span> PG.withTransaction conn <span class="kw">do</span>
          P.findUser conn userId <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
            <span class="dt">Nothing</span> <span class="ot">-&gt;</span> pure <span class="dt">Nothing</span>
            <span class="dt">Just</span> (<span class="dt">User</span> user) <span class="ot">-&gt;</span> <span class="kw">do</span>
              <span class="kw">let</span> user' <span class="fu">=</span> <span class="dt">User</span> (user { name <span class="fu">=</span> userName })
              P.updateUser conn user'
              pure <span class="fu">$</span> <span class="dt">Just</span> user'
        <span class="kw">case</span> savedUser <span class="kw">of</span>
          <span class="dt">Nothing</span> <span class="ot">-&gt;</span> respond <span class="dv">404</span> { error<span class="fu">:</span> <span class="st">&quot;User not found with id: &quot;</span> <span class="fu">&lt;&gt;</span> show userId }
          <span class="dt">Just</span> user <span class="ot">-&gt;</span> respond <span class="dv">200</span> (encode user)
  <span class="kw">where</span>
    getUserPatch <span class="fu">=</span> lift getBody <span class="fu">&gt;&gt;=</span> V.except <span class="fu">&lt;&lt;&lt;</span> renderForeignErrors
    getUserName <span class="fu">=</span> V.exceptCond <span class="st">&quot;User name must not be empty&quot;</span> (_ <span class="fu">/=</span> <span class="st">&quot;&quot;</span>)

<span class="ot">listUsers ::</span> forall eff<span class="fu">.</span> <span class="dt">PG.Pool</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span> <span class="fu">|</span> eff)
listUsers pool <span class="fu">=</span> liftAff (PG.withConnection pool P.listUsers) <span class="fu">&gt;&gt;=</span> encode <span class="fu">&gt;&gt;&gt;</span> respond <span class="dv">200</span>

<span class="ot">getUserId ::</span> forall eff<span class="fu">.</span> <span class="dt">V.Validation</span> eff <span class="dt">Int</span>
getUserId <span class="fu">=</span> lift (getRouteParam <span class="st">&quot;id&quot;</span>)
  <span class="fu">&gt;&gt;=</span> V.exceptMaybe <span class="st">&quot;User ID is required&quot;</span>
  <span class="fu">&gt;&gt;=</span> fromString <span class="fu">&gt;&gt;&gt;</span> V.exceptMaybe <span class="st">&quot;User ID must be an integer&quot;</span>
  <span class="fu">&gt;&gt;=</span> V.exceptCond <span class="st">&quot;User ID must be positive&quot;</span> (_ <span class="fu">&gt;</span> <span class="dv">0</span>)

<span class="ot">renderForeignErrors ::</span> forall a<span class="fu">.</span> <span class="dt">Either</span> (<span class="dt">NonEmptyList</span> <span class="dt">ForeignError</span>) a <span class="ot">-&gt;</span> <span class="dt">Either</span> <span class="dt">String</span> a
renderForeignErrors <span class="fu">=</span> lmap (toList <span class="fu">&gt;&gt;&gt;</span> map renderForeignError <span class="fu">&gt;&gt;&gt;</span> intercalate <span class="st">&quot;, &quot;</span>)

<span class="ot">respond ::</span> forall eff a<span class="fu">.</span> <span class="dt">Int</span> <span class="ot">-&gt;</span> a <span class="ot">-&gt;</span> <span class="dt">Handler</span> eff
respond status body <span class="fu">=</span> <span class="kw">do</span>
  setStatus status
  sendJson body

<span class="ot">respondNoContent ::</span> forall eff<span class="fu">.</span> <span class="dt">Int</span> <span class="ot">-&gt;</span> <span class="dt">Handler</span> eff
respondNoContent status <span class="fu">=</span> <span class="kw">do</span>
  setStatus status
  end</code></pre></div>
<p>The code is much cleaner now. Let’s try out a few test cases:</p>
<pre class="http"><code>$ http POST http://localhost:4000/v1/users id:=3 name=roger
HTTP/1.1 201 Created
Connection: keep-alive
Content-Length: 0
Date: Sat, 30 Sep 2017 12:13:37 GMT
X-Powered-By: Express</code></pre>
<pre class="http"><code>$ http POST http://localhost:4000/v1/users id:=3
HTTP/1.1 422 Unprocessable Entity
Connection: keep-alive
Content-Length: 102
Content-Type: application/json; charset=utf-8
Date: Sat, 30 Sep 2017 12:13:50 GMT
ETag: W/&quot;66-/c4cfoquQZGwtDBUzHjJydJAHJ0&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;Error at array index 0: (ErrorAtProperty \&quot;name\&quot; (TypeMismatch \&quot;String\&quot; \&quot;Undefined\&quot;))&quot;
}</code></pre>
<pre class="http"><code>$ http POST http://localhost:4000/v1/users id:=3 name=&quot;&quot;
HTTP/1.1 422 Unprocessable Entity
Connection: keep-alive
Content-Length: 39
Content-Type: application/json; charset=utf-8
Date: Sat, 30 Sep 2017 12:14:02 GMT
ETag: W/&quot;27-JQsh12xu/rEFdWy8REF4NMtBUB4&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User name must not be empty&quot;
}</code></pre>
<pre class="http"><code>$ http POST http://localhost:4000/v1/users id:=0 name=roger
HTTP/1.1 422 Unprocessable Entity
Connection: keep-alive
Content-Length: 36
Content-Type: application/json; charset=utf-8
Date: Sat, 30 Sep 2017 12:14:14 GMT
ETag: W/&quot;24-Pvt1L4eGilBmVtaOGHlSReJ413E&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User ID must be positive&quot;
}</code></pre>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/3
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 23
Content-Type: application/json; charset=utf-8
Date: Sat, 30 Sep 2017 12:14:28 GMT
ETag: W/&quot;17-1scpiB1FT9DBu9s4I1gNWSjH2go&quot;
X-Powered-By: Express

{
    &quot;id&quot;: 3,
    &quot;name&quot;: &quot;roger&quot;
}</code></pre>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/asdf
HTTP/1.1 422 Unprocessable Entity
Connection: keep-alive
Content-Length: 38
Content-Type: application/json; charset=utf-8
Date: Sat, 30 Sep 2017 12:14:40 GMT
ETag: W/&quot;26-//tvORl1gGDUMwgSaqbEpJhuadI&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User ID must be an integer&quot;
}</code></pre>
<pre class="http"><code>$ http GET http://localhost:4000/v1/user/-1
HTTP/1.1 422 Unprocessable Entity
Connection: keep-alive
Content-Length: 36
Content-Type: application/json; charset=utf-8
Date: Sat, 30 Sep 2017 12:14:45 GMT
ETag: W/&quot;24-Pvt1L4eGilBmVtaOGHlSReJ413E&quot;
X-Powered-By: Express

{
    &quot;error&quot;: &quot;User ID must be positive&quot;
}</code></pre>
<p>It works as expected.</p>
<h2 id="configuration">Configuration<a href="#configuration" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>Right now our application configuration resides in the <code>main</code> function:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell">main <span class="fu">=</span> runServer port databaseConfig
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
<p>We are going to extract it out of the code and read it from the environment variables using the <a href="https://pursuit.purescript.org/packages/purescript-config" target="_blank" rel="noopener"><code>purescript-config</code></a> package. First, we install the required packages using <a href="http://bower.io" target="_blank" rel="noopener">bower</a>.</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">bower</span> install --save purescript-node-process purescript-config</code></pre></div>
<p>Now, we write the following code in the <code>src/SimpleService/Config.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">SimpleService.Config</span> <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Data.Config</span>
<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Control.Monad.Eff</span> (<span class="dt">Eff</span>)
<span class="kw">import </span><span class="dt">Data.Config.Node</span> (fromEnv)
<span class="kw">import </span><span class="dt">Data.Either</span> (<span class="dt">Either</span>)
<span class="kw">import </span><span class="dt">Data.Set</span> (<span class="dt">Set</span>)
<span class="kw">import </span><span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span>
<span class="kw">import </span><span class="dt">Node.Process</span> (<span class="dt">PROCESS</span>)

<span class="kw">type</span> <span class="dt">ServerConfig</span> <span class="fu">=</span>
  {<span class="ot"> port           ::</span> <span class="dt">Int</span>
  ,<span class="ot"> databaseConfig ::</span> <span class="dt">PG.PoolConfiguration</span>
  }

<span class="ot">databaseConfig ::</span> <span class="dt">Config</span> {<span class="ot">name ::</span> <span class="dt">String</span>} <span class="dt">PG.PoolConfiguration</span>
databaseConfig <span class="fu">=</span>
  { user<span class="fu">:</span> _, password<span class="fu">:</span> _, host<span class="fu">:</span> _, port<span class="fu">:</span> _, database<span class="fu">:</span> _, max<span class="fu">:</span> _, idleTimeoutMillis<span class="fu">:</span> _ }
  <span class="fu">&lt;$&gt;</span> string {name<span class="fu">:</span> <span class="st">&quot;user&quot;</span>}
  <span class="fu">&lt;*&gt;</span> string {name<span class="fu">:</span> <span class="st">&quot;password&quot;</span>}
  <span class="fu">&lt;*&gt;</span> string {name<span class="fu">:</span> <span class="st">&quot;host&quot;</span>}
  <span class="fu">&lt;*&gt;</span> int    {name<span class="fu">:</span> <span class="st">&quot;port&quot;</span>}
  <span class="fu">&lt;*&gt;</span> string {name<span class="fu">:</span> <span class="st">&quot;database&quot;</span>}
  <span class="fu">&lt;*&gt;</span> int    {name<span class="fu">:</span> <span class="st">&quot;pool_size&quot;</span>}
  <span class="fu">&lt;*&gt;</span> int    {name<span class="fu">:</span> <span class="st">&quot;idle_conn_timeout_millis&quot;</span>}

<span class="ot">portConfig ::</span> <span class="dt">Config</span> {<span class="ot">name ::</span> <span class="dt">String</span>} <span class="dt">Int</span>
portConfig <span class="fu">=</span> int {name<span class="fu">:</span> <span class="st">&quot;port&quot;</span>}

<span class="ot">serverConfig ::</span> <span class="dt">Config</span> {<span class="ot">name ::</span> <span class="dt">String</span>} <span class="dt">ServerConfig</span>
serverConfig <span class="fu">=</span>
  { port<span class="fu">:</span> _, databaseConfig<span class="fu">:</span> _}
  <span class="fu">&lt;$&gt;</span> portConfig
  <span class="fu">&lt;*&gt;</span> prefix {name<span class="fu">:</span> <span class="st">&quot;db&quot;</span>} databaseConfig

<span class="ot">readServerConfig ::</span> forall eff<span class="fu">.</span>
                    <span class="dt">Eff</span> (<span class="ot">process ::</span> <span class="dt">PROCESS</span> <span class="fu">|</span> eff) (<span class="dt">Either</span> (<span class="dt">Set</span> <span class="dt">String</span>) <span class="dt">ServerConfig</span>)
readServerConfig <span class="fu">=</span> fromEnv <span class="st">&quot;SS&quot;</span> serverConfig</code></pre></div>
<p>We use the applicative DSL provided in <code>Data.Config</code> module to build a description of our configuration. This description contains the keys and types of the configuration, for consumption by various interpreters. Then we use the <code>fromEnv</code> interpreter to read the config from the environment variables derived from the <code>name</code> fields in the records in the description in the <code>readServerConfig</code> function. We also write a bash script to set those environment variables in the development environment in the <code>setenv.sh</code> file:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash"><span class="bu">export</span> <span class="va">SS_PORT=</span>4000
<span class="bu">export</span> <span class="va">SS_DB_USER=</span><span class="st">&quot;abhinav&quot;</span>
<span class="bu">export</span> <span class="va">SS_DB_PASSWORD=</span><span class="st">&quot;&quot;</span>
<span class="bu">export</span> <span class="va">SS_DB_HOST=</span><span class="st">&quot;localhost&quot;</span>
<span class="bu">export</span> <span class="va">SS_DB_PORT=</span>5432
<span class="bu">export</span> <span class="va">SS_DB_DATABASE=</span><span class="st">&quot;simple_service&quot;</span>
<span class="bu">export</span> <span class="va">SS_DB_POOL_SIZE=</span>10
<span class="bu">export</span> <span class="va">SS_DB_IDLE_CONN_TIMEOUT_MILLIS=</span>1000</code></pre></div>
<p>Now we rewrite our <code>src/Main.purs</code> file to use the <code>readServerConfig</code> function:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">Main</span> <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Control.Monad.Eff</span> (<span class="dt">Eff</span>)
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Console</span> (<span class="dt">CONSOLE</span>, log)
<span class="kw">import </span><span class="dt">Data.Either</span> (<span class="dt">Either</span>(..))
<span class="kw">import </span><span class="dt">Data.Set</span> (toUnfoldable)
<span class="kw">import </span><span class="dt">Data.String</span> (joinWith)
<span class="kw">import </span><span class="dt">Database.PostgreSQL</span> <span class="kw">as</span> <span class="dt">PG</span>
<span class="kw">import </span><span class="dt">Node.Express.Types</span> (<span class="dt">EXPRESS</span>)
<span class="kw">import </span><span class="dt">Node.Process</span> (<span class="dt">PROCESS</span>)
<span class="kw">import </span><span class="dt">Node.Process</span> <span class="kw">as</span> <span class="dt">Process</span>
<span class="kw">import </span><span class="dt">SimpleService.Config</span> (readServerConfig)
<span class="kw">import </span><span class="dt">SimpleService.Server</span> (runServer)

<span class="ot">main ::</span> forall eff<span class="fu">.</span> <span class="dt">Eff</span> (<span class="ot"> console ::</span> <span class="dt">CONSOLE</span>
                        ,<span class="ot"> express ::</span> <span class="dt">EXPRESS</span>
                        ,<span class="ot"> postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span>
                        ,<span class="ot"> process ::</span> <span class="dt">PROCESS</span>
                        <span class="fu">|</span> eff ) <span class="dt">Unit</span>
main <span class="fu">=</span> readServerConfig <span class="fu">&gt;&gt;=</span> <span class="kw">case</span> _ <span class="kw">of</span>
  <span class="dt">Left</span> missingKeys <span class="ot">-&gt;</span> <span class="kw">do</span>
    log <span class="fu">$</span> <span class="st">&quot;Unable to start. Missing Env keys: &quot;</span> <span class="fu">&lt;&gt;</span> joinWith <span class="st">&quot;, &quot;</span> (toUnfoldable missingKeys)
    Process.exit <span class="dv">1</span>
  <span class="dt">Right</span> { port, databaseConfig } <span class="ot">-&gt;</span> runServer port databaseConfig</code></pre></div>
<p>If <code>readServerConfig</code> fails, we print the missing keys to the console and exit the process. Else we run the server with the read config.</p>
<p>To test this, we stop the server we ran in the beginning, source the config, and run it again:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">pulp</span> --watch run
<span class="ex">*</span> Building project in /Users/abhinav/ps-simple-rest-service
<span class="ex">*</span> Build successful.
<span class="ex">Server</span> listening on :4000
^<span class="ex">C</span>
$ <span class="bu">source</span> setenv.sh
$ <span class="ex">pulp</span> --watch run
<span class="ex">*</span> Building project in /Users/abhinav/ps-simple-rest-service
<span class="ex">*</span> Build successful.
<span class="ex">Server</span> listening on :4000</code></pre></div>
<p>It works! We test the failure case by opening another terminal which does not have the environment variables set:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">pulp</span> run
<span class="ex">*</span> Building project in /Users/abhinav/ps-simple-rest-service
<span class="ex">*</span> Build successful.
<span class="ex">Unable</span> to start. Missing Env keys: SS_DB_DATABASE, SS_DB_HOST, SS_DB_IDLE_CONN_TIMEOUT_MILLIS, SS_DB_PASSWORD, SS_DB_POOL_SIZE, SS_DB_PORT, SS_DB_USER, SS_PORT
<span class="ex">*</span> ERROR: Subcommand terminated with exit code 1</code></pre></div>
<p>Up next, we add logging to our application.</p>
<h2 id="logging">Logging<a href="#logging" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>For logging, we use the <a href="https://pursuit.purescript.org/packages/purescript-logging" target="_blank" rel="noopener"><code>purescript-logging</code></a> package. We write a logger which logs to <code>stdout</code>; in the <code>src/SimpleService/Logger.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="kw">module</span> <span class="dt">SimpleService.Logger</span>
  ( debug
  , info
  , warn
  , error
  ) <span class="kw">where</span>

<span class="kw">import </span><span class="dt">Prelude</span>

<span class="kw">import </span><span class="dt">Control.Logger</span> <span class="kw">as</span> <span class="dt">L</span>
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Class</span> (class <span class="dt">MonadEff</span>, liftEff)
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Console</span> <span class="kw">as</span> <span class="dt">C</span>
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Now</span> (<span class="dt">NOW</span>, now)
<span class="kw">import </span><span class="dt">Data.DateTime.Instant</span> (toDateTime)
<span class="kw">import </span><span class="dt">Data.Either</span> (fromRight)
<span class="kw">import </span><span class="dt">Data.Formatter.DateTime</span> (<span class="dt">Formatter</span>, format, parseFormatString)
<span class="kw">import </span><span class="dt">Data.Generic.Rep</span> (class <span class="dt">Generic</span>)
<span class="kw">import </span><span class="dt">Data.Generic.Rep.Show</span> (genericShow)
<span class="kw">import </span><span class="dt">Data.String</span> (toUpper)
<span class="kw">import </span><span class="dt">Partial.Unsafe</span> (unsafePartial)

<span class="kw">data</span> <span class="dt">Level</span> <span class="fu">=</span> <span class="dt">Debug</span> <span class="fu">|</span> <span class="dt">Info</span> <span class="fu">|</span> <span class="dt">Warn</span> <span class="fu">|</span> <span class="dt">Error</span>

derive <span class="kw">instance</span><span class="ot"> eqLevel ::</span> <span class="dt">Eq</span> <span class="dt">Level</span>
derive <span class="kw">instance</span><span class="ot"> ordLevel ::</span> <span class="dt">Ord</span> <span class="dt">Level</span>
derive <span class="kw">instance</span><span class="ot"> genericLevel ::</span> <span class="dt">Generic</span> <span class="dt">Level</span> _

<span class="kw">instance</span><span class="ot"> showLevel ::</span> <span class="dt">Show</span> <span class="dt">Level</span> <span class="kw">where</span>
  show <span class="fu">=</span> toUpper <span class="fu">&lt;&lt;&lt;</span> genericShow

<span class="kw">type</span> <span class="dt">Entry</span> <span class="fu">=</span>
  {<span class="ot"> level   ::</span> <span class="dt">Level</span>
  ,<span class="ot"> message ::</span> <span class="dt">String</span>
  }

<span class="ot">dtFormatter ::</span> <span class="dt">Formatter</span>
dtFormatter <span class="fu">=</span> unsafePartial <span class="fu">$</span> fromRight <span class="fu">$</span> parseFormatString <span class="st">&quot;YYYY-MM-DD HH:mm:ss.SSS&quot;</span>

<span class="ot">logger ::</span> forall m e<span class="fu">.</span> (
          <span class="dt">MonadEff</span> (<span class="ot">console ::</span> <span class="dt">C.CONSOLE</span>,<span class="ot"> now ::</span> <span class="dt">NOW</span> <span class="fu">|</span> e) m) <span class="ot">=&gt;</span> <span class="dt">L.Logger</span> m <span class="dt">Entry</span>
logger <span class="fu">=</span> <span class="dt">L.Logger</span> <span class="fu">$</span> \{ level, message } <span class="ot">-&gt;</span> liftEff <span class="kw">do</span>
  time <span class="ot">&lt;-</span> toDateTime <span class="fu">&lt;$&gt;</span> now
  C.log <span class="fu">$</span> <span class="st">&quot;[&quot;</span> <span class="fu">&lt;&gt;</span> format dtFormatter time <span class="fu">&lt;&gt;</span> <span class="st">&quot;] &quot;</span> <span class="fu">&lt;&gt;</span> show level <span class="fu">&lt;&gt;</span> <span class="st">&quot; &quot;</span> <span class="fu">&lt;&gt;</span> message

log<span class="ot"> ::</span> forall m e<span class="fu">.</span>
        <span class="dt">MonadEff</span> (<span class="ot">console ::</span> <span class="dt">C.CONSOLE</span> ,<span class="ot"> now ::</span> <span class="dt">NOW</span> <span class="fu">|</span> e) m
     <span class="ot">=&gt;</span> <span class="dt">Entry</span> <span class="ot">-&gt;</span> m <span class="dt">Unit</span>
log entry<span class="fu">@</span>{level} <span class="fu">=</span> L.log (L.cfilter (\e <span class="ot">-&gt;</span> e<span class="fu">.</span>level <span class="fu">==</span> level) logger) entry

<span class="ot">debug ::</span> forall m e<span class="fu">.</span>
         <span class="dt">MonadEff</span> (<span class="ot">console ::</span> <span class="dt">C.CONSOLE</span> ,<span class="ot"> now ::</span> <span class="dt">NOW</span> <span class="fu">|</span> e) m <span class="ot">=&gt;</span> <span class="dt">String</span> <span class="ot">-&gt;</span> m <span class="dt">Unit</span>
debug message <span class="fu">=</span> log { level<span class="fu">:</span> <span class="dt">Debug</span>, message }

<span class="ot">info ::</span> forall m e<span class="fu">.</span>
        <span class="dt">MonadEff</span> (<span class="ot">console ::</span> <span class="dt">C.CONSOLE</span> ,<span class="ot"> now ::</span> <span class="dt">NOW</span> <span class="fu">|</span> e) m <span class="ot">=&gt;</span> <span class="dt">String</span> <span class="ot">-&gt;</span> m <span class="dt">Unit</span>
info message <span class="fu">=</span> log { level<span class="fu">:</span> <span class="dt">Info</span>, message }

<span class="ot">warn ::</span> forall m e<span class="fu">.</span>
        <span class="dt">MonadEff</span> (<span class="ot">console ::</span> <span class="dt">C.CONSOLE</span> ,<span class="ot"> now ::</span> <span class="dt">NOW</span> <span class="fu">|</span> e) m <span class="ot">=&gt;</span> <span class="dt">String</span> <span class="ot">-&gt;</span> m <span class="dt">Unit</span>
warn message <span class="fu">=</span> log { level<span class="fu">:</span> <span class="dt">Warn</span>, message }

error<span class="ot"> ::</span> forall m e<span class="fu">.</span>
         <span class="dt">MonadEff</span> (<span class="ot">console ::</span> <span class="dt">C.CONSOLE</span> ,<span class="ot"> now ::</span> <span class="dt">NOW</span> <span class="fu">|</span> e) m <span class="ot">=&gt;</span> <span class="dt">String</span> <span class="ot">-&gt;</span> m <span class="dt">Unit</span>
error message <span class="fu">=</span> log { level<span class="fu">:</span> <span class="dt">Error</span>, message }</code></pre></div>
<p><code>purescript-logging</code> lets us define our own logging levels and loggers. We define four log levels, and a log entry type with the log level and the message. Then we write the logger which will print the log entry to <code>stdout</code> along with the current time as a well formatted string. We define convenience functions for each log level.</p>
<p>Before we proceed, let’s install the required dependencies.</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">bower</span> install --save purescript-logging purescript-now purescript-formatters</code></pre></div>
<p>Now we add a request logger middleware to our server in the <code>src/SimpleService/Server.purs</code> file:</p>
<div class="sourceCode"><pre class="sourceCode haskell"><code class="sourceCode haskell"><span class="co">-- previous code</span>
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Console</span> (<span class="dt">CONSOLE</span>)
<span class="kw">import </span><span class="dt">Control.Monad.Eff.Now</span> (<span class="dt">NOW</span>)
<span class="kw">import </span><span class="dt">Data.Maybe</span> (maybe)
<span class="kw">import </span><span class="dt">Data.String</span> (toUpper)
<span class="kw">import </span><span class="dt">Node.Express.App</span> (<span class="dt">App</span>, all, delete, get, http, listenHttp, post, use, useExternal, useOnError)
<span class="kw">import </span><span class="dt">Node.Express.Handler</span> (<span class="dt">Handler</span>, next)
<span class="kw">import </span><span class="dt">Node.Express.Request</span> (getMethod, getPath)
<span class="kw">import </span><span class="dt">SimpleService.Logger</span> <span class="kw">as</span> <span class="dt">Log</span>
<span class="co">-- previous code</span>

<span class="ot">requestLogger ::</span> forall eff<span class="fu">.</span> <span class="dt">Handler</span> (<span class="ot">console ::</span> <span class="dt">CONSOLE</span>,<span class="ot"> now ::</span> <span class="dt">NOW</span> <span class="fu">|</span> eff)
requestLogger <span class="fu">=</span> <span class="kw">do</span>
  method <span class="ot">&lt;-</span> getMethod
  path   <span class="ot">&lt;-</span> getPath
  Log.debug <span class="fu">$</span> <span class="st">&quot;HTTP: &quot;</span> <span class="fu">&lt;&gt;</span> maybe <span class="st">&quot;&quot;</span> id ((toUpper <span class="fu">&lt;&lt;&lt;</span> show) <span class="fu">&lt;$&gt;</span> method) <span class="fu">&lt;&gt;</span> <span class="st">&quot; &quot;</span> <span class="fu">&lt;&gt;</span> path
  next

<span class="ot">app ::</span> forall eff<span class="fu">.</span>
       <span class="dt">PG.Pool</span>
    <span class="ot">-&gt;</span> <span class="dt">App</span> (<span class="ot">postgreSQL ::</span> <span class="dt">PG.POSTGRESQL</span>,<span class="ot"> console ::</span> <span class="dt">CONSOLE</span>,<span class="ot"> now ::</span> <span class="dt">NOW</span> <span class="fu">|</span> eff)
app pool <span class="fu">=</span> <span class="kw">do</span>
  useExternal jsonBodyParser
  use requestLogger
  <span class="co">-- previous code</span></code></pre></div>
<p>We also convert all our previous logging statements which used <code>Console.log</code> to use <code>SimpleService.Logger</code> and add logs in our handlers. We can see logging in effect by restarting the server and hitting it:</p>
<div class="sourceCode"><pre class="sourceCode bash"><code class="sourceCode bash">$ <span class="ex">pulp</span> --watch run
<span class="ex">*</span> Building project in /Users/abhinav/ps-simple-rest-service
<span class="ex">*</span> Build successful.
[<span class="ex">2017-09-30</span> 16:02:41.634] INFO Server listening on :4000
[<span class="ex">2017-09-30</span> 16:02:43.494] DEBUG HTTP: PATCH /v1/user/3
[<span class="ex">2017-09-30</span> 16:02:43.517] DEBUG Updated user: 3
[<span class="ex">2017-09-30</span> 16:03:46.615] DEBUG HTTP: DELETE /v1/user/3
[<span class="ex">2017-09-30</span> 16:03:46.635] DEBUG Deleted user 3
[<span class="ex">2017-09-30</span> 16:05:03.805] DEBUG HTTP: GET /v1/users</code></pre></div>
<h2 id="conclusion">Conclusion<a href="#conclusion" class="ref-link"></a><a href="#top" class="top-link" title="Back to top"></a></h2>
<p>In this tutorial we learned how to create a simple JSON REST web service written in Purescript with persistence, validation, configuration and logging. The complete code for this tutorial can be found in <a href="https://github.com/abhin4v/ps-simple-rest-service" target="_blank" rel="noopener">github</a>. This post can be discussed on <a href="https://www.reddit.com/r/purescript/comments/73gc9g/writing_a_simple_rest_service_in_purescript_part/" target="_blank" rel="noopener">r/purescript</a>.</p><p>If you liked this post, please <a href="https://abhinavsarkar.net/posts/ps-simple-rest-service-2/#comment-container">leave a comment</a>.</p><div class="author">
  <img src="https://nilenso.com/images/people/abhinav-200.png" style="width: 96px; height: 96;">
  <span style="position: absolute; padding: 32px 15px;">
    <i>Original post by <a href="http://twitter.com/abhin4v">Abhinav Sarkar</a> - check out <a href="https://abhinavsarkar.net">All posts on abhinavsarkar.net</a></i>
  </span>
</div>