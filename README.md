# blog.nilenso.com
Scripts to automate the nilenso blog/planet (v2)

## Installing

```
rbenv install 2.2.3
bundle install
```

## Generating + Publishing

```
make clean && make
```

...that should be it. If you have trouble with `planet.rb` or `Jekyll`, fork those repos, make your change, and get a PR back into the mainline. This repository should only contain tiny wrapper scripts and configuration.


## Troubleshooting

Only a few plugins have been carried over from [planet-nilenso](http://github.com/nilenso/planet-nilenso). If an aspect of the blog/planet appears to be broken, look in the `/plugins` directory of `planet-nilenso` for anything suspicious we may have forgotten. The less we need from there the better, though.
