run:
	rbenv local < .ruby-version
	bundle exec jekyll serve --host=0.0.0.0 --watch
