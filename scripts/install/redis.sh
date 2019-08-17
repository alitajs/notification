apt-get update
apt-get install gcc automake autoconf libtool make
cd /etc/
wget http://download.redis.io/releases/redis-5.0.5.tar.gz
tar xzf redis-5.0.5.tar.gz
rm redis-5.0.5.tar.gz
cd redis-5.0.5
make distclean
make
ln /etc/redis-5.0.5/src/redis-cli /usr/local/bin/redis-cli
ln /etc/redis-5.0.5/src/redis-server /usr/local/bin/redis-server
echo "# redis config" >> /etc/redis-5.0.5/redis.conf
echo "include /etc/redis-5.0.5/local.conf" >> /etc/redis-5.0.5/redis.conf
echo "daemonize yes" > /etc/redis-5.0.5/local.conf
redis-server /etc/redis-5.0.5/redis.conf
