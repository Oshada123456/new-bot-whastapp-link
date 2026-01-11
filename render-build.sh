#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Install Chrome
apt-get update && apt-get install -y google-chrome-stable
