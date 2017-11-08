link-preload
============

It's a polyfill for [`<link rel="preload">`](https://w3c.github.io/preload/), great feature implemented only in WebKit so far
(see lastest data [here](http://caniuse.com/#search=preload)). **100% compatibility with specification and existing
implementations is not guaranteed**.

# Why?

Just read [great article here](https://css-tricks.com/prefetching-preloading-prebrowsing/#article-header-id-5).

# Example usage

Check out [live demo](http://jsbin.com/koweluj/edit?html).

```
<head>
   <link
      rel="preload"
      as="style"
      href="/link/to/stylesheet.css"
      onload="this.onload=function(){};this.rel='stylesheet';"
    >
</head>
<body>
  <script src="/link/to/polyfill.js"></script>
</body>
```

**Important note:** value of `onload` attribute is very important. Resetting it to no-op function is crucial for working the
polyfill cross-browser (it's required by Internet Explorer which tends to falling into endless loop otherwise).
