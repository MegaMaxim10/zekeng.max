#!/usr/bin/env bash

# -------------------------
# Public HTML entry points
# -------------------------
mkdir -p public
touch public/index.html \
      public/about.html \
      public/teaching.html \
      public/research.html \
      public/consulting.html \
      public/activities.html \
      public/writing.html \
      public/news.html \
      public/contact.html

# -------------------------
# Content (JSON-driven)
# -------------------------
mkdir -p content

touch content/site.json

mkdir -p content/home
touch content/home/home.json

mkdir -p content/about
touch content/about/about.json

mkdir -p content/teaching
touch content/teaching/teaching.json \
      content/teaching/courses.json

mkdir -p content/research
touch content/research/research.json \
      content/research/projects.json \
      content/research/publications.json \
      content/research/supervision.json

mkdir -p content/consulting
touch content/consulting/consulting.json \
      content/consulting/projects.json

mkdir -p content/activities
touch content/activities/activities.json

mkdir -p content/writing/posts
touch content/writing/writing.json

mkdir -p content/news/posts

mkdir -p content/contact
touch content/contact/contact.json

# -------------------------
# Assets
# -------------------------
mkdir -p assets/images/{profile,teaching,research,activities}
mkdir -p assets/documents/{cv,publications,slides}
mkdir -p assets/icons

# -------------------------
# Source files
# -------------------------
mkdir -p src/css
touch src/css/main.css \
      src/css/layout.css \
      src/css/components.css \
      src/css/themes.css

mkdir -p src/js/components
touch src/js/app.js \
      src/js/router.js \
      src/js/renderer.js \
      src/js/components/header.js \
      src/js/components/footer.js \
      src/js/components/timeline.js \
      src/js/components/card.js \
      src/js/components/form.js

mkdir -p src/templates
touch src/templates/page.html \
      src/templates/section.html

# -------------------------
# CI/CD
# -------------------------
mkdir -p .github/workflows
touch .github/workflows/deploy.yml

# -------------------------
# Root files
# -------------------------
touch README.md
touch package.json

echo "Project structure created successfully."
