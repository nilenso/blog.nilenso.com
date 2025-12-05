NODE_STAMP := .npm-install.stamp

public: $(NODE_STAMP)
	npm run build:og
	bundle exec jekyll build

$(NODE_STAMP): package-lock.json
	npm ci
	touch $(NODE_STAMP)

clean:
	rm -rf ./public $(NODE_STAMP) node_modules

serve: $(NODE_STAMP)
	npm run build:og
	bundle exec jekyll serve
