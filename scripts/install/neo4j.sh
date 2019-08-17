wget -O - https://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
echo 'deb https://debian.neo4j.org/repo stable/' | tee /etc/apt/sources.list.d/neo4j.list
apt-get update
apt-get install neo4j
