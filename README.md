# Template for SENG365 student repo


# Overview of the continuous deployment process

1. You hackity hack...
2. You commit your changes to your git repo on eng-git.canterbury.ac.nz.
3. That triggers the GitLab CI runner, which starts a GitLab docker executor on the build VM (as defined in /etc/gitlab-runner/config.toml) to build your application within a docker container.
4. The executor runs the build defined in your .gitlab-ci.yml, by passing each script line in the build section to a container which includes binaries for docker compose in an otherwise standard docker-in-docker image. (We use a form of the "'docker socket binding" method) 
5. The docker executor now runs the build script in .gitlab-ci.yml (docker compose build) in the build container.
6. Docker compose build follows the build steps from docker-compose.yml to build the application.
7. If the build step succeeds, the CI runner on the VM then runs the scripts in the deploy section of .gitlab-ci.yml in the same way.
8. This calls docker compose down to stop any previous version of your app, and then docker compose up to start the now-built services defined in docker-compose.yml, using that files definition for the port mapping from container to host ports. 
9. Your application is now up-and-running.
10. As docker compose up in .gitlab-ci.yml has the -d flag, the CM runner doesn't wait for it to finish and so can immediately mark the deploy as complete.
