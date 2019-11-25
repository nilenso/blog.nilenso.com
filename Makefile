public:
	bundle exec planet generate
	bundle exec rake transform_planet_exts
	bundle exec middleman build

clean:
	rm -rf ./public