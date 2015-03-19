#!/bin/bash
##
# This script will package and upload a successful build to Amazon S3. It should only
# execute under the following conditions:
#
#   * The build was performed on the CUL-DigitalServices repository
#   * The build was performed on the master branch
#   * The build was not performed on a pull request to the master branch
##

EXPECTED_REPOSITORY="CUL-DigitalServices/grasshopper-ui"
EXPECTED_BRANCH="master"
EXPECTED_PULL_REQUEST=true

function package_and_upload {
    echo 'PACKAGE AND UPLOAD 2'
    rm -rf ./target
    ./bin/package -su --upload-bucket=grasshopper-ui-releases --upload-region=eu-west-1
}

echo '$TRAVIS_REPO_SLUG:' $TRAVIS_REPO_SLUG
echo '$EXPECTED_REPOSITORY:' $EXPECTED_REPOSITORY
echo '$TRAVIS_BRANCH:' $TRAVIS_BRANCH
echo '$EXPECTED_BRANCH:' $EXPECTED_BRANCH
echo '$TRAVIS_PULL_REQUEST:' $TRAVIS_PULL_REQUEST
echo '$EXPECTED_PULL_REQUEST:' $EXPECTED_PULL_REQUEST

if [[ "$EXPECTED_REPOSITORY" == "$EXPECTED_REPOSITORY" && "$EXPECTED_BRANCH" == "$EXPECTED_BRANCH" && "$EXPECTED_PULL_REQUEST" == "$EXPECTED_PULL_REQUEST" ]]; then
    echo 'PACKAGE AND UPLOAD'
    package_and_upload
fi
