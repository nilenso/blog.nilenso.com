# blog.nilenso.com
Scripts to automate the nilenso blog/planet (v2)


## Prerequisites

Install `rbenv` and add this to `~/.bash_profile`:
```
brew install rbenv
export PATH="$HOME/.rbenv/bin:$PATH"
```

Install Node.js 18+ for generating Open Graph images:
```
brew install node@18
```

## Using rvm
Install `rvm` and run
```
\curl -sSL https://get.rvm.io | bash -s stable --ruby
rvm use ruby-3.0.0
```

## Installing

You will probably need to close and re-open your shell after each of these commands, because Ruby.

```
rbenv instal 3.0.0
gem install bundler
bundle install
npm install
```


## Generating + Publishing

First, make your changes to `planet.yml` in the root directory. Then,

```
make clean && make
```

...that should be it. If you have trouble with `planet.rb` or `Jekyll`, fork those repos, make your change, and get a PR back into the mainline. This repository should only contain tiny wrapper scripts and configuration.

## Local server
```
make serve
```

## Open Graph images

Generate Open Graph previews for all posts (images are written to `source/og` and mapped via `source/_data/og-images.json`):
```
npm run build:og
```

The script only regenerates images when a post or the template changes. To force regeneration or target a single post:
```
node bin/generate-og-images.js --force
node bin/generate-og-images.js --post source/_posts/2020-01-02-offline-first-apps-are-appropriate-for-many-clini.markdown
```

## Deploying

Push to master branch in the repo (built assets not required). The [deploy script in server](bin/generate-planet.sh) should pick up the changes, build assets and deploy them in some time.

## Troubleshooting

Only a few plugins have been carried over from [planet-nilenso](http://github.com/nilenso/planet-nilenso). If an aspect of the blog/planet appears to be broken, look in the `/plugins` directory of `planet-nilenso` for anything suspicious we may have forgotten. The less we need from there the better, though.

## Adding / Removing feeds & tags

### Adding a new feed
New feeds can be added to the planet.yml under the `blogs` section. The configuration would look something as follows:
```
  - author: "Akshay Gupta"
    feed: "https://blog.kitallis.in/feeds/posts/default"
    image: "https://nilenso.com/images/people/kitallis.webp"
    twitter: "kitallis"
```

### Removing older feeds
Feeds can be removed by removing the author configuration from the planet.yml file. This *WILL NOT* remove the older blog posts from these authors as they are added to the `source/_posts` directory

### Adding new tags
New tags can be added under the `whitelisted_tags` section in planet.yml.

### Caveats
Adding a new tag *WILL ADD* posts with this tag from all the active feeds. Thus historical posts will also be added from the active feeds.
