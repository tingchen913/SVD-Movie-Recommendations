from __future__ import with_statement
from fabric.api import *

def deploy():
    with cd("/usr/local/www/svddemo"):
        run("git pull")
        run("npm install")
        run("npm prune")
        run("supervisorctl restart svddemo")

