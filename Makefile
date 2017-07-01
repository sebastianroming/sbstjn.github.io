run:
	rbenv local system
	bundle install
	bundle exec jekyll serve --host=0.0.0.0 --watch

build:
	gem install bundler
	bundle install
	jekyll build