declare module 'redis' {
  import { ServerInfo } from '@types/redis';
  export * from '@types/redis';

  type PromiseWithNull<T> = Promise<T | null>;

  interface OverloadedCommand<T, U, R> {
    (arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T): PromiseWithNull<U>;
    (arg1: T, arg2: T, arg3: T, arg4: T, arg5: T): PromiseWithNull<U>;
    (arg1: T, arg2: T, arg3: T, arg4: T): PromiseWithNull<U>;
    (arg1: T, arg2: T, arg3: T): PromiseWithNull<U>;
    (arg1: T, arg2: T | T[]): PromiseWithNull<U>;
    (arg1: T | T[]): PromiseWithNull<U>;
    (...args: T[]): PromiseWithNull<U>;
  }

  interface OverloadedKeyCommand<T, U, R> {
    (key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T): PromiseWithNull<U>;
    (key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T): PromiseWithNull<U>;
    (key: string, arg1: T, arg2: T, arg3: T, arg4: T): PromiseWithNull<U>;
    (key: string, arg1: T, arg2: T, arg3: T): PromiseWithNull<U>;
    (key: string, arg1: T, arg2: T): PromiseWithNull<U>;
    (key: string, arg1: T | T[]): PromiseWithNull<U>;
    (key: string, ...args: Array<T>): PromiseWithNull<U>;
    (...args: Array<string | T>): PromiseWithNull<U>;
  }

  interface OverloadedListCommand<T, U, R> {
    (arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T): PromiseWithNull<U>;
    (arg1: T, arg2: T, arg3: T, arg4: T, arg5: T): PromiseWithNull<U>;
    (arg1: T, arg2: T, arg3: T, arg4: T): PromiseWithNull<U>;
    (arg1: T, arg2: T, arg3: T): PromiseWithNull<U>;
    (arg1: T, arg2: T): PromiseWithNull<U>;
    (arg1: T | T[]): PromiseWithNull<U>;
    (...args: Array<T>): PromiseWithNull<U>;
  }

  interface OverloadedSetCommand<T, U, R> {
    (key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T): PromiseWithNull<U>;
    (key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T): PromiseWithNull<U>;
    (key: string, arg1: T, arg2: T, arg3: T, arg4: T): PromiseWithNull<U>;
    (key: string, arg1: T, arg2: T, arg3: T): PromiseWithNull<U>;
    (key: string, arg1: T, arg2: T): PromiseWithNull<U>;
    (key: string, arg1: T | { [key: string]: T } | T[]): PromiseWithNull<U>;
    (key: string, ...args: Array<T>): PromiseWithNull<U>;
    (args: [string, ...T[]]): PromiseWithNull<U>;
  }

  interface OverloadedLastCommand<T1, T2, U, R> {
    (arg1: T1, arg2: T1, arg3: T1, arg4: T1, arg5: T1, arg6: T2): PromiseWithNull<U>;
    (arg1: T1, arg2: T1, arg3: T1, arg4: T1, arg5: T2): PromiseWithNull<U>;
    (arg1: T1, arg2: T1, arg3: T1, arg4: T2): PromiseWithNull<U>;
    (arg1: T1, arg2: T1, arg3: T2): PromiseWithNull<U>;
    (arg1: T1, arg2: T2 | Array<T1 | T2>): PromiseWithNull<U>;
    (args: Array<T1 | T2>): PromiseWithNull<U>;
    (...args: Array<T1 | T2>): PromiseWithNull<U>;
  }

  export interface PromisifiedCommands {
    /**
     * KILL - Kill the connection of a client.
     * LIST - Get the list of client connections.
     * GETNAME - Get the current connection name.
     * PAUSE - Stop processing commands from clients for some time.
     * REPLY - Instruct the server whether to reply to commands.
     * SETNAME - Set the current connection name.
     */
    client: OverloadedCommand<string, any, R>;
    CLIENT: OverloadedCommand<string, any, R>;

    /**
     * Set multiple hash fields to multiple values.
     */
    hmset: OverloadedSetCommand<string | number, 'OK', R>;
    HMSET: OverloadedSetCommand<string | number, 'OK', R>;

    /**
     * Listen for messages published to the given channels.
     */
    subscribe: OverloadedListCommand<string, string, R>;
    SUBSCRIBE: OverloadedListCommand<string, string, R>;

    /**
     * Stop listening for messages posted to the given channels.
     */
    unsubscribe: OverloadedListCommand<string, string, R>;
    UNSUBSCRIBE: OverloadedListCommand<string, string, R>;

    /**
     * Listen for messages published to channels matching the given patterns.
     */
    psubscribe: OverloadedListCommand<string, string, R>;
    PSUBSCRIBE: OverloadedListCommand<string, string, R>;

    /**
     * Stop listening for messages posted to channels matching the given patterns.
     */
    punsubscribe: OverloadedListCommand<string, string, R>;
    PUNSUBSCRIBE: OverloadedListCommand<string, string, R>;

    /**
     * Perform arbitrary bitfield integer operations on strings.
     */
    bitfield: OverloadedKeyCommand<string | number, [number, number], R>;
    BITFIELD: OverloadedKeyCommand<string | number, [number, number], R>;

    /**
     * Remove and get the first element in a list, or block until one is available.
     */
    blpop: OverloadedLastCommand<string, number, [string, string], R>;
    BLPOP: OverloadedLastCommand<string, number, [string, string], R>;

    /**
     * Remove and get the last element in a list, or block until one is available.
     */
    brpop: OverloadedLastCommand<string, number, [string, string], R>;
    BRPOP: OverloadedLastCommand<string, number, [string, string], R>;

    /**
     * ADDSLOTS - Assign new hash slots to receiving node.
     * COUNT-FAILURE-REPORTS - Return the number of failure reports active for a given node.
     * COUNTKEYSINSLOT - Return the number of local keys in the specified hash slot.
     * DELSLOTS - Set hash slots as unbound in receiving node.
     * FAILOVER - Forces a slave to perform a manual failover of its master.
     * FORGET - Remove a node from the nodes table.
     * GETKEYSINSLOT - Return local key names in the specified hash slot.
     * INFO - Provides info about Redis Cluster node state.
     * KEYSLOT - Returns the hash slot of the specified key.
     * MEET - Force a node cluster to handshake with another node.
     * NODES - Get cluster config for the node.
     * REPLICATE - Reconfigure a node as a slave of the specified master node.
     * RESET - Reset a Redis Cluster node.
     * SAVECONFIG - Forces the node to save cluster state on disk.
     * SET-CONFIG-EPOCH - Set the configuration epoch in a new node.
     * SETSLOT - Bind a hash slot to a specified node.
     * SLAVES - List slave nodes of the specified master node.
     * SLOTS - Get array of Cluster slot to node mappings.
     */
    cluster: OverloadedCommand<string, any, this>;
    CLUSTER: OverloadedCommand<string, any, this>;

    /**
     * Get array of Redis command details.
     *
     * COUNT - Get array of Redis command details.
     * GETKEYS - Extract keys given a full Redis command.
     * INFO - Get array of specific Redis command details.
     * GET - Get the value of a configuration parameter.
     * REWRITE - Rewrite the configuration file with the in memory configuration.
     * SET - Set a configuration parameter to the given value.
     * RESETSTAT - Reset the stats returned by INFO.
     */
    config: OverloadedCommand<string, boolean, R>;
    CONFIG: OverloadedCommand<string, boolean, R>;

    /**
     * OBJECT - Get debugging information about a key.
     * SEGFAULT - Make the server crash.
     */
    debug: OverloadedCommand<string, boolean, R>;
    DEBUG: OverloadedCommand<string, boolean, R>;

    /**
     * Delete a key.
     */
    del: OverloadedCommand<string, number, R>;
    DEL: OverloadedCommand<string, number, R>;

    /**
     * Execute a Lua script server side.
     */
    eval: OverloadedCommand<string | number, any, R>;
    EVAL: OverloadedCommand<string | number, any, R>;

    /**
     * Execute a Lue script server side.
     */
    evalsha: OverloadedCommand<string | number, any, R>;
    EVALSHA: OverloadedCommand<string | number, any, R>;

    /**
     * Determine if a key exists.
     */
    exists: OverloadedCommand<string, number, R>;
    EXISTS: OverloadedCommand<string, number, R>;

    /**
     * Add one or more geospatial items in the geospatial index represented using a sorted set.
     */
    geoadd: OverloadedKeyCommand<string | number, number, R>;
    GEOADD: OverloadedKeyCommand<string | number, number, R>;

    /**
     * Returns members of a geospatial index as standard geohash strings.
     */
    geohash: OverloadedKeyCommand<string, string, R>;
    GEOHASH: OverloadedKeyCommand<string, string, R>;

    /**
     * Returns longitude and latitude of members of a geospatial index.
     */
    geopos: OverloadedKeyCommand<string, Array<[number, number]>, R>;
    GEOPOS: OverloadedKeyCommand<string, Array<[number, number]>, R>;

    /**
     * Returns the distance between two members of a geospatial index.
     */
    geodist: OverloadedKeyCommand<string, string, R>;
    GEODIST: OverloadedKeyCommand<string, string, R>;

    /**
     * Query a sorted set representing a geospatial index to fetch members matching a given maximum distance from a point.
     */
    georadius: OverloadedKeyCommand<
      string | number,
      Array<string | [string, string | [string, string]]>,
      R
    >;
    GEORADIUS: OverloadedKeyCommand<
      string | number,
      Array<string | [string, string | [string, string]]>,
      R
    >;

    /**
     * Query a sorted set representing a geospatial index to fetch members matching a given maximum distance from a member.
     */
    georadiusbymember: OverloadedKeyCommand<
      string | number,
      Array<string | [string, string | [string, string]]>,
      R
    >;
    GEORADIUSBYMEMBER: OverloadedKeyCommand<
      string | number,
      Array<string | [string, string | [string, string]]>,
      R
    >;

    /**
     * Delete on or more hash fields.
     */
    hdel: OverloadedKeyCommand<string, number, R>;
    HDEL: OverloadedKeyCommand<string, number, R>;

    /**
     * Get the values of all the given hash fields.
     */
    hmget: OverloadedKeyCommand<string, string[], R>;
    HMGET: OverloadedKeyCommand<string, string[], R>;

    /**
     * Prepend one or multiple values to a list.
     */
    lpush: OverloadedKeyCommand<string, number, R>;
    LPUSH: OverloadedKeyCommand<string, number, R>;

    /**
     * Get the values of all given keys.
     */
    mget: OverloadedCommand<string, string[], R>;
    MGET: OverloadedCommand<string, string[], R>;

    /**
     * Atomically tranfer a key from a Redis instance to another one.
     */
    migrate: OverloadedCommand<string, boolean, R>;
    MIGRATE: OverloadedCommand<string, boolean, R>;

    /**
     * Set multiple keys to multiple values.
     */
    mset: OverloadedCommand<string, boolean, R>;
    MSET: OverloadedCommand<string, boolean, R>;

    /**
     * Set multiple keys to multiple values, only if none of the keys exist.
     */
    msetnx: OverloadedCommand<string, boolean, R>;
    MSETNX: OverloadedCommand<string, boolean, R>;

    /**
     * Inspect the internals of Redis objects.
     */
    object: OverloadedCommand<string, any, R>;
    OBJECT: OverloadedCommand<string, any, R>;

    /**
     * Adds the specified elements to the specified HyperLogLog.
     */
    pfadd: OverloadedKeyCommand<string, number, R>;
    PFADD: OverloadedKeyCommand<string, number, R>;

    /**
     * Return the approximated cardinality of the set(s) observed by the HyperLogLog at key(s).
     */
    pfcount: OverloadedCommand<string, number, R>;
    PFCOUNT: OverloadedCommand<string, number, R>;

    /**
     * Merge N different HyperLogLogs into a single one.
     */
    pfmerge: OverloadedCommand<string, boolean, R>;
    PFMERGE: OverloadedCommand<string, boolean, R>;

    /**
     * Inspect the state of the Pub/Sub subsytem.
     */
    pubsub: OverloadedCommand<string, number, R>;
    PUBSUB: OverloadedCommand<string, number, R>;

    /**
     * Append one or multiple values to a list.
     */
    rpush: OverloadedKeyCommand<string, number, R>;
    RPUSH: OverloadedKeyCommand<string, number, R>;

    /**
     * Append one or multiple members to a set.
     */
    sadd: OverloadedKeyCommand<string, number, R>;
    SADD: OverloadedKeyCommand<string, number, R>;

    /**
     * DEBUG - Set the debug mode for executed scripts.
     * EXISTS - Check existence of scripts in the script cache.
     * FLUSH - Remove all scripts from the script cache.
     * KILL - Kill the script currently in execution.
     * LOAD - Load the specified Lua script into the script cache.
     */
    script: OverloadedCommand<string, any, R>;
    SCRIPT: OverloadedCommand<string, any, R>;

    /**
     * Subtract multiple sets.
     */
    sdiff: OverloadedCommand<string, string[], R>;
    SDIFF: OverloadedCommand<string, string[], R>;

    /**
     * Subtract multiple sets and store the resulting set in a key.
     */
    sdiffstore: OverloadedKeyCommand<string, number, R>;
    SDIFFSTORE: OverloadedKeyCommand<string, number, R>;

    /**
     * Synchronously save the dataset to disk and then shut down the server.
     */
    shutdown: OverloadedCommand<string, string, R>;
    SHUTDOWN: OverloadedCommand<string, string, R>;

    /**
     * Intersect multiple sets.
     */
    sinter: OverloadedKeyCommand<string, string[], R>;
    SINTER: OverloadedKeyCommand<string, string[], R>;

    /**
     * Intersect multiple sets and store the resulting set in a key.
     */
    sinterstore: OverloadedCommand<string, number, R>;
    SINTERSTORE: OverloadedCommand<string, number, R>;

    /**
     * Manages the Redis slow queries log.
     */
    slowlog: OverloadedCommand<string, Array<[number, number, number, string[]]>, R>;
    SLOWLOG: OverloadedCommand<string, Array<[number, number, number, string[]]>, R>;

    /**
     * Sort the elements in a list, set or sorted set.
     */
    sort: OverloadedCommand<string, string[], R>;
    SORT: OverloadedCommand<string, string[], R>;

    /**
     * Remove one or more members from a set.
     */
    srem: OverloadedKeyCommand<string, number, R>;
    SREM: OverloadedKeyCommand<string, number, R>;

    /**
     * Add multiple sets.
     */
    sunion: OverloadedCommand<string, string[], R>;
    SUNION: OverloadedCommand<string, string[], R>;

    /**
     * Add multiple sets and store the resulting set in a key.
     */
    sunionstore: OverloadedCommand<string, number, R>;
    SUNIONSTORE: OverloadedCommand<string, number, R>;

    /**
     * Watch the given keys to determine execution of the MULTI/EXEC block.
     */
    watch: OverloadedCommand<string, 'OK', R>;
    WATCH: OverloadedCommand<string, 'OK', R>;

    /**
     * Add one or more members to a sorted set, or update its score if it already exists.
     */
    zadd: OverloadedKeyCommand<string | number, number, R>;
    ZADD: OverloadedKeyCommand<string | number, number, R>;

    /**
     * Intersect multiple sorted sets and store the resulting sorted set in a new key.
     */
    zinterstore: OverloadedCommand<string | number, number, R>;
    ZINTERSTORE: OverloadedCommand<string | number, number, R>;

    /**
     * Remove one or more members from a sorted set.
     */
    zrem: OverloadedKeyCommand<string, number, R>;
    ZREM: OverloadedKeyCommand<string, number, R>;

    /**
     * Add multiple sorted sets and store the resulting sorted set in a new key.
     */
    zunionstore: OverloadedCommand<string | number, number, R>;
    ZUNIONSTORE: OverloadedCommand<string | number, number, R>;

    /**
     * Incrementally iterate the keys space.
     */
    scan: OverloadedCommand<string, [string, string[]], R>;
    SCAN: OverloadedCommand<string, [string, string[]], R>;

    /**
     * Incrementally iterate Set elements.
     */
    sscan: OverloadedKeyCommand<string, [string, string[]], R>;
    SSCAN: OverloadedKeyCommand<string, [string, string[]], R>;

    /**
     * Incrementally iterate hash fields and associated values.
     */
    hscan: OverloadedKeyCommand<string, [string, string[]], R>;
    HSCAN: OverloadedKeyCommand<string, [string, string[]], R>;

    /**
     * Incrementally iterate sorted sets elements and associated scores.
     */
    zscan: OverloadedKeyCommand<string, [string, string[]], R>;
    ZSCAN: OverloadedKeyCommand<string, [string, string[]], R>;
    /**
     * Listen for all requests received by the server in real time.
     */
    monitor(): PromiseWithNull<undefined>;
    MONITOR(): PromiseWithNull<undefined>;

    /**
     * Get information and statistics about the server.
     */
    info(): PromiseWithNull<ServerInfo>;
    info(section?: string | string[]): PromiseWithNull<ServerInfo>;
    INFO(): PromiseWithNull<ServerInfo>;
    INFO(section?: string | string[]): PromiseWithNull<ServerInfo>;

    /**
     * Ping the server.
     */
    ping(): PromiseWithNull<string>;
    ping(message: string): PromiseWithNull<string>;
    PING(): PromiseWithNull<string>;
    PING(message: string): PromiseWithNull<string>;

    /**
     * Post a message to a channel.
     */
    publish(channel: string, value: string): PromiseWithNull<number>;
    PUBLISH(channel: string, value: string): PromiseWithNull<number>;

    /**
     * Authenticate to the server.
     */
    auth(password: string): PromiseWithNull<string>;
    AUTH(password: string): PromiseWithNull<string>;

    /**
     * Append a value to a key.
     */
    append(key: string, value: string): PromiseWithNull<number>;
    APPEND(key: string, value: string): PromiseWithNull<number>;

    /**
     * Asynchronously rewrite the append-only file.
     */
    bgrewriteaof(): PromiseWithNull<'OK'>;
    BGREWRITEAOF(): PromiseWithNull<'OK'>;

    /**
     * Asynchronously save the dataset to disk.
     */
    bgsave(): PromiseWithNull<string>;
    BGSAVE(): PromiseWithNull<string>;

    /**
     * Count set bits in a string.
     */
    bitcount(key: string): PromiseWithNull<number>;
    bitcount(key: string, start: number, end: number): PromiseWithNull<number>;
    BITCOUNT(key: string): PromiseWithNull<number>;
    BITCOUNT(key: string, start: number, end: number): PromiseWithNull<number>;

    /**
     * Perform bitwise operations between strings.
     */
    bitop(
      operation: string,
      destkey: string,
      key1: string,
      key2: string,
      key3: string,
    ): PromiseWithNull<number>;
    bitop(operation: string, destkey: string, key1: string, key2: string): PromiseWithNull<number>;
    bitop(operation: string, destkey: string, key: string): PromiseWithNull<number>;
    bitop(operation: string, destkey: string, ...args: Array<string>): PromiseWithNull<number>;
    BITOP(
      operation: string,
      destkey: string,
      key1: string,
      key2: string,
      key3: string,
    ): PromiseWithNull<number>;
    BITOP(operation: string, destkey: string, key1: string, key2: string): PromiseWithNull<number>;
    BITOP(operation: string, destkey: string, key: string): PromiseWithNull<number>;
    BITOP(operation: string, destkey: string, ...args: Array<string>): PromiseWithNull<number>;

    /**
     * Find first bit set or clear in a string.
     */
    bitpos(key: string, bit: number, start: number, end: number): PromiseWithNull<number>;
    bitpos(key: string, bit: number, start: number): PromiseWithNull<number>;
    bitpos(key: string, bit: number): PromiseWithNull<number>;
    BITPOS(key: string, bit: number, start: number, end: number): PromiseWithNull<number>;
    BITPOS(key: string, bit: number, start: number): PromiseWithNull<number>;
    BITPOS(key: string, bit: number): PromiseWithNull<number>;

    /**
     * Pop a value from a list, push it to another list and return it; or block until one is available.
     */
    brpoplpush(source: string, destination: string, timeout: number): PromiseWithNull<string>;
    BRPOPLPUSH(source: string, destination: string, timeout: number): PromiseWithNull<string>;

    /**
     * Get array of Redis command details.
     *
     * COUNT - Get total number of Redis commands.
     * GETKEYS - Extract keys given a full Redis command.
     * INFO - Get array of specific REdis command details.
     */
    command(): PromiseWithNull<[string, number, string[], number, number, number][]>;
    COMMAND(): PromiseWithNull<[string, number, string[], number, number, number][]>;

    /**
     * Return the number of keys in the selected database.
     */
    dbsize(): PromiseWithNull<number>;
    DBSIZE(): PromiseWithNull<number>;

    /**
     * Decrement the integer value of a key by one.
     */
    decr(key: string): PromiseWithNull<number>;
    DECR(key: string): PromiseWithNull<number>;

    /**
     * Decrement the integer value of a key by the given number.
     */
    decrby(key: string, decrement: number): PromiseWithNull<number>;
    DECRBY(key: string, decrement: number): PromiseWithNull<number>;

    /**
     * Discard all commands issued after MULTI.
     */
    discard(): PromiseWithNull<'OK'>;
    DISCARD(): PromiseWithNull<'OK'>;

    /**
     * Return a serialized version of the value stored at the specified key.
     */
    dump(key: string): PromiseWithNull<string>;
    DUMP(key: string): PromiseWithNull<string>;

    /**
     * Echo the given string.
     */
    echo<T extends string>(message: T): PromiseWithNull<T>;
    ECHO<T extends string>(message: T): PromiseWithNull<T>;

    /**
     * Set a key's time to live in seconds.
     */
    expire(key: string, seconds: number): PromiseWithNull<number>;
    EXPIRE(key: string, seconds: number): PromiseWithNull<number>;

    /**
     * Set the expiration for a key as a UNIX timestamp.
     */
    expireat(key: string, timestamp: number): PromiseWithNull<number>;
    EXPIREAT(key: string, timestamp: number): PromiseWithNull<number>;

    /**
     * Remove all keys from all databases.
     */
    flushall(): PromiseWithNull<string>;
    FLUSHALL(): PromiseWithNull<string>;

    /**
     * Remove all keys from the current database.
     */
    flushdb(): PromiseWithNull<'OK'>;
    FLUSHDB(): PromiseWithNull<'OK'>;

    /**
     * Get the value of a key.
     */
    get(key: string): PromiseWithNull<string>;
    GET(key: string): PromiseWithNull<string>;

    /**
     * Returns the bit value at offset in the string value stored at key.
     */
    getbit(key: string, offset: number): PromiseWithNull<number>;
    GETBIT(key: string, offset: number): PromiseWithNull<number>;

    /**
     * Get a substring of the string stored at a key.
     */
    getrange(key: string, start: number, end: number): PromiseWithNull<string>;
    GETRANGE(key: string, start: number, end: number): PromiseWithNull<string>;

    /**
     * Set the string value of a key and return its old value.
     */
    getset(key: string, value: string): PromiseWithNull<string>;
    GETSET(key: string, value: string): PromiseWithNull<string>;

    /**
     * Determine if a hash field exists.
     */
    hexists(key: string, field: string): PromiseWithNull<number>;
    HEXISTS(key: string, field: string): PromiseWithNull<number>;

    /**
     * Get the value of a hash field.
     */
    hget(key: string, field: string): PromiseWithNull<string>;
    HGET(key: string, field: string): PromiseWithNull<string>;

    /**
     * Get all fields and values in a hash.
     */
    hgetall(key: string): PromiseWithNull<{ [key: string]: string }>;
    HGETALL(key: string): PromiseWithNull<{ [key: string]: string }>;

    /**
     * Increment the integer value of a hash field by the given number.
     */
    hincrby(key: string, field: string, increment: number): PromiseWithNull<number>;
    HINCRBY(key: string, field: string, increment: number): PromiseWithNull<number>;

    /**
     * Increment the float value of a hash field by the given amount.
     */
    hincrbyfloat(key: string, field: string, increment: number): PromiseWithNull<string>;
    HINCRBYFLOAT(key: string, field: string, increment: number): PromiseWithNull<string>;

    /**
     * Get all the fields of a hash.
     */
    hkeys(key: string): PromiseWithNull<string[]>;
    HKEYS(key: string): PromiseWithNull<string[]>;

    /**
     * Get the number of fields in a hash.
     */
    hlen(key: string): PromiseWithNull<number>;
    HLEN(key: string): PromiseWithNull<number>;

    /**
     * Set the string value of a hash field.
     */
    hset(key: string, field: string, value: string): PromiseWithNull<number>;
    HSET(key: string, field: string, value: string): PromiseWithNull<number>;

    /**
     * Set the value of a hash field, only if the field does not exist.
     */
    hsetnx(key: string, field: string, value: string): PromiseWithNull<number>;
    HSETNX(key: string, field: string, value: string): PromiseWithNull<number>;

    /**
     * Get the length of the value of a hash field.
     */
    hstrlen(key: string, field: string): PromiseWithNull<number>;
    HSTRLEN(key: string, field: string): PromiseWithNull<number>;

    /**
     * Get all the values of a hash.
     */
    hvals(key: string): PromiseWithNull<string[]>;
    HVALS(key: string): PromiseWithNull<string[]>;

    /**
     * Increment the integer value of a key by one.
     */
    incr(key: string): PromiseWithNull<number>;
    INCR(key: string): PromiseWithNull<number>;

    /**
     * Increment the integer value of a key by the given amount.
     */
    incrby(key: string, increment: number): PromiseWithNull<number>;
    INCRBY(key: string, increment: number): PromiseWithNull<number>;

    /**
     * Increment the float value of a key by the given amount.
     */
    incrbyfloat(key: string, increment: number): PromiseWithNull<string>;
    INCRBYFLOAT(key: string, increment: number): PromiseWithNull<string>;

    /**
     * Find all keys matching the given pattern.
     */
    keys(pattern: string): PromiseWithNull<string[]>;
    KEYS(pattern: string): PromiseWithNull<string[]>;

    /**
     * Get the UNIX time stamp of the last successful save to disk.
     */
    lastsave(): PromiseWithNull<number>;
    LASTSAVE(): PromiseWithNull<number>;

    /**
     * Get an element from a list by its index.
     */
    lindex(key: string, index: number): PromiseWithNull<string>;
    LINDEX(key: string, index: number): PromiseWithNull<string>;

    /**
     * Insert an element before or after another element in a list.
     */
    linsert(
      key: string,
      dir: 'BEFORE' | 'AFTER',
      pivot: string,
      value: string,
    ): PromiseWithNull<string>;
    LINSERT(
      key: string,
      dir: 'BEFORE' | 'AFTER',
      pivot: string,
      value: string,
    ): PromiseWithNull<string>;

    /**
     * Get the length of a list.
     */
    llen(key: string): PromiseWithNull<number>;
    LLEN(key: string): PromiseWithNull<number>;

    /**
     * Remove and get the first element in a list.
     */
    lpop(key: string): PromiseWithNull<string>;
    LPOP(key: string): PromiseWithNull<string>;

    /**
     * Prepend a value to a list, only if the list exists.
     */
    lpushx(key: string, value: string): PromiseWithNull<number>;
    LPUSHX(key: string, value: string): PromiseWithNull<number>;

    /**
     * Get a range of elements from a list.
     */
    lrange(key: string, start: number, stop: number): PromiseWithNull<string[]>;
    LRANGE(key: string, start: number, stop: number): PromiseWithNull<string[]>;

    /**
     * Remove elements from a list.
     */
    lrem(key: string, count: number, value: string): PromiseWithNull<number>;
    LREM(key: string, count: number, value: string): PromiseWithNull<number>;

    /**
     * Set the value of an element in a list by its index.
     */
    lset(key: string, index: number, value: string): PromiseWithNull<'OK'>;
    LSET(key: string, index: number, value: string): PromiseWithNull<'OK'>;

    /**
     * Trim a list to the specified range.
     */
    ltrim(key: string, start: number, stop: number): PromiseWithNull<'OK'>;
    LTRIM(key: string, start: number, stop: number): PromiseWithNull<'OK'>;

    /**
     * Move a key to another database.
     */
    move(key: string, db: string | number): PromiseWithNull<undefined>;
    MOVE(key: string, db: string | number): PromiseWithNull<undefined>;

    /**
     * Remove the expiration from a key.
     */
    persist(key: string): PromiseWithNull<number>;
    PERSIST(key: string): PromiseWithNull<number>;

    /**
     * Remove a key's time to live in milliseconds.
     */
    pexpire(key: string, milliseconds: number): PromiseWithNull<number>;
    PEXPIRE(key: string, milliseconds: number): PromiseWithNull<number>;

    /**
     * Set the expiration for a key as a UNIX timestamp specified in milliseconds.
     */
    pexpireat(key: string, millisecondsTimestamp: number): PromiseWithNull<number>;
    PEXPIREAT(key: string, millisecondsTimestamp: number): PromiseWithNull<number>;

    /**
     * Set the value and expiration in milliseconds of a key.
     */
    psetex(key: string, milliseconds: number, value: string): PromiseWithNull<'OK'>;
    PSETEX(key: string, milliseconds: number, value: string): PromiseWithNull<'OK'>;

    /**
     * Get the time to live for a key in milliseconds.
     */
    pttl(key: string): PromiseWithNull<number>;
    PTTL(key: string): PromiseWithNull<number>;

    /**
     * Close the connection.
     */
    quit(): PromiseWithNull<'OK'>;
    QUIT(): PromiseWithNull<'OK'>;

    /**
     * Return a random key from the keyspace.
     */
    randomkey(): PromiseWithNull<string>;
    RANDOMKEY(): PromiseWithNull<string>;

    /**
     * Enables read queries for a connection to a cluster slave node.
     */
    readonly(): PromiseWithNull<string>;
    READONLY(): PromiseWithNull<string>;

    /**
     * Disables read queries for a connection to cluster slave node.
     */
    readwrite(): PromiseWithNull<string>;
    READWRITE(): PromiseWithNull<string>;

    /**
     * Rename a key.
     */
    rename(key: string, newkey: string): PromiseWithNull<'OK'>;
    RENAME(key: string, newkey: string): PromiseWithNull<'OK'>;

    /**
     * Rename a key, only if the new key does not exist.
     */
    renamenx(key: string, newkey: string): PromiseWithNull<number>;
    RENAMENX(key: string, newkey: string): PromiseWithNull<number>;

    /**
     * Create a key using the provided serialized value, previously obtained using DUMP.
     */
    restore(key: string, ttl: number, serializedValue: string): PromiseWithNull<'OK'>;
    RESTORE(key: string, ttl: number, serializedValue: string): PromiseWithNull<'OK'>;

    /**
     * Return the role of the instance in the context of replication.
     */
    role(): PromiseWithNull<[string, number, Array<[string, string, string]>]>;
    ROLE(): PromiseWithNull<[string, number, Array<[string, string, string]>]>;

    /**
     * Remove and get the last element in a list.
     */
    rpop(key: string): PromiseWithNull<string>;
    RPOP(key: string): PromiseWithNull<string>;

    /**
     * Remove the last element in a list, prepend it to another list and return it.
     */
    rpoplpush(source: string, destination: string): PromiseWithNull<string>;
    RPOPLPUSH(source: string, destination: string): PromiseWithNull<string>;

    /**
     * Append a value to a list, only if the list exists.
     */
    rpushx(key: string, value: string): PromiseWithNull<number>;
    RPUSHX(key: string, value: string): PromiseWithNull<number>;

    /**
     * Synchronously save the dataset to disk.
     */
    save(): PromiseWithNull<string>;
    SAVE(): PromiseWithNull<string>;

    /**
     * Get the number of members in a set.
     */
    scard(key: string): PromiseWithNull<number>;
    SCARD(key: string): PromiseWithNull<number>;

    /**
     * Change the selected database for the current connection.
     */
    select(index: number | string): PromiseWithNull<string>;
    SELECT(index: number | string): PromiseWithNull<string>;

    /**
     * Set the string value of a key.
     */
    set(key: string, value: string): PromiseWithNull<'OK'>;
    set(key: string, value: string, flag: string): PromiseWithNull<'OK'>;
    set(
      key: string,
      value: string,
      mode: string,
      duration: number,
    ): PromiseWithNull<'OK' | undefined>;
    set(
      key: string,
      value: string,
      mode: string,
      duration: number,
      flag: string,
    ): PromiseWithNull<'OK' | undefined>;
    SET(key: string, value: string): PromiseWithNull<'OK'>;
    SET(key: string, value: string, flag: string): PromiseWithNull<'OK'>;
    SET(
      key: string,
      value: string,
      mode: string,
      duration: number,
    ): PromiseWithNull<'OK' | undefined>;
    SET(
      key: string,
      value: string,
      mode: string,
      duration: number,
      flag: string,
    ): PromiseWithNull<'OK' | undefined>;

    /**
     * Sets or clears the bit at offset in the string value stored at key.
     */
    setbit(key: string, offset: number, value: string): PromiseWithNull<number>;
    SETBIT(key: string, offset: number, value: string): PromiseWithNull<number>;

    /**
     * Set the value and expiration of a key.
     */
    setex(key: string, seconds: number, value: string): PromiseWithNull<string>;
    SETEX(key: string, seconds: number, value: string): PromiseWithNull<string>;

    /**
     * Set the value of a key, only if the key does not exist.
     */
    setnx(key: string, value: string): PromiseWithNull<number>;
    SETNX(key: string, value: string): PromiseWithNull<number>;

    /**
     * Overwrite part of a string at key starting at the specified offset.
     */
    setrange(key: string, offset: number, value: string): PromiseWithNull<number>;
    SETRANGE(key: string, offset: number, value: string): PromiseWithNull<number>;

    /**
     * Determine if a given value is a member of a set.
     */
    sismember(key: string, member: string): PromiseWithNull<number>;
    SISMEMBER(key: string, member: string): PromiseWithNull<number>;

    /**
     * Make the server a slave of another instance, or promote it as master.
     */
    slaveof(host: string, port: string | number): PromiseWithNull<string>;
    SLAVEOF(host: string, port: string | number): PromiseWithNull<string>;

    /**
     * Get all the members in a set.
     */
    smembers(key: string): PromiseWithNull<string[]>;
    SMEMBERS(key: string): PromiseWithNull<string[]>;

    /**
     * Move a member from one set to another.
     */
    smove(source: string, destination: string, member: string): PromiseWithNull<number>;
    SMOVE(source: string, destination: string, member: string): PromiseWithNull<number>;

    /**
     * Remove and return one or multiple random members from a set.
     */
    spop(key: string): PromiseWithNull<string>;
    spop(key: string, count: number): PromiseWithNull<string[]>;
    SPOP(key: string): PromiseWithNull<string>;
    SPOP(key: string, count: number): PromiseWithNull<string[]>;

    /**
     * Get one or multiple random members from a set.
     */
    srandmember(key: string): PromiseWithNull<string>;
    srandmember(key: string, count: number): PromiseWithNull<string[]>;
    SRANDMEMBER(key: string): PromiseWithNull<string>;
    SRANDMEMBER(key: string, count: number): PromiseWithNull<string[]>;

    /**
     * Get the length of the value stored in a key.
     */
    strlen(key: string): PromiseWithNull<number>;
    STRLEN(key: string): PromiseWithNull<number>;

    /**
     * Internal command used for replication.
     */
    sync(): PromiseWithNull<undefined>;
    SYNC(): PromiseWithNull<undefined>;

    /**
     * Return the current server time.
     */
    time(): PromiseWithNull<[string, string]>;
    TIME(): PromiseWithNull<[string, string]>;

    /**
     * Get the time to live for a key.
     */
    ttl(key: string): PromiseWithNull<number>;
    TTL(key: string): PromiseWithNull<number>;

    /**
     * Determine the type stored at key.
     */
    type(key: string): PromiseWithNull<string>;
    TYPE(key: string): PromiseWithNull<string>;

    /**
     * Forget about all watched keys.
     */
    unwatch(): PromiseWithNull<'OK'>;
    UNWATCH(): PromiseWithNull<'OK'>;

    /**
     * Wait for the synchronous replication of all the write commands sent in the context of the current connection.
     */
    wait(numslaves: number, timeout: number): PromiseWithNull<number>;
    WAIT(numslaves: number, timeout: number): PromiseWithNull<number>;

    /**
     * Get the number of members in a sorted set.
     */
    zcard(key: string): PromiseWithNull<number>;
    ZCARD(key: string): PromiseWithNull<number>;

    /**
     * Count the members in a sorted set with scores between the given values.
     */
    zcount(key: string, min: number | string, max: number | string): PromiseWithNull<number>;
    ZCOUNT(key: string, min: number | string, max: number | string): PromiseWithNull<number>;

    /**
     * Increment the score of a member in a sorted set.
     */
    zincrby(key: string, increment: number, member: string): PromiseWithNull<string>;
    ZINCRBY(key: string, increment: number, member: string): PromiseWithNull<string>;

    /**
     * Count the number of members in a sorted set between a given lexicographic range.
     */
    zlexcount(key: string, min: string, max: string): PromiseWithNull<number>;
    ZLEXCOUNT(key: string, min: string, max: string): PromiseWithNull<number>;

    /**
     * Return a range of members in a sorted set, by index.
     */
    zrange(key: string, start: number, stop: number): PromiseWithNull<string[]>;
    zrange(key: string, start: number, stop: number, withscores: string): PromiseWithNull<string[]>;
    ZRANGE(key: string, start: number, stop: number): PromiseWithNull<string[]>;
    ZRANGE(key: string, start: number, stop: number, withscores: string): PromiseWithNull<string[]>;

    /**
     * Return a range of members in a sorted set, by lexicographical range.
     */
    zrangebylex(key: string, min: string, max: string): PromiseWithNull<string[]>;
    zrangebylex(
      key: string,
      min: string,
      max: string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;
    ZRANGEBYLEX(key: string, min: string, max: string): PromiseWithNull<string[]>;
    ZRANGEBYLEX(
      key: string,
      min: string,
      max: string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;

    /**
     * Return a range of members in a sorted set, by lexicographical range, ordered from higher to lower strings.
     */
    zrevrangebylex(key: string, min: string, max: string): PromiseWithNull<string[]>;
    zrevrangebylex(
      key: string,
      min: string,
      max: string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;
    ZREVRANGEBYLEX(key: string, min: string, max: string): PromiseWithNull<string[]>;
    ZREVRANGEBYLEX(
      key: string,
      min: string,
      max: string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;

    /**
     * Return a range of members in a sorted set, by score.
     */
    zrangebyscore(
      key: string,
      min: number | string,
      max: number | string,
    ): PromiseWithNull<string[]>;
    zrangebyscore(
      key: string,
      min: number | string,
      max: number | string,
      withscores: string,
    ): PromiseWithNull<string[]>;
    zrangebyscore(
      key: string,
      min: number | string,
      max: number | string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;
    zrangebyscore(
      key: string,
      min: number | string,
      max: number | string,
      withscores: string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;
    ZRANGEBYSCORE(
      key: string,
      min: number | string,
      max: number | string,
    ): PromiseWithNull<string[]>;
    ZRANGEBYSCORE(
      key: string,
      min: number | string,
      max: number | string,
      withscores: string,
    ): PromiseWithNull<string[]>;
    ZRANGEBYSCORE(
      key: string,
      min: number | string,
      max: number | string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;
    ZRANGEBYSCORE(
      key: string,
      min: number | string,
      max: number | string,
      withscores: string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;

    /**
     * Determine the index of a member in a sorted set.
     */
    zrank(key: string, member: string): PromiseWithNull<number>;
    ZRANK(key: string, member: string): PromiseWithNull<number>;

    /**
     * Remove all members in a sorted set between the given lexicographical range.
     */
    zremrangebylex(key: string, min: string, max: string): PromiseWithNull<number>;
    ZREMRANGEBYLEX(key: string, min: string, max: string): PromiseWithNull<number>;

    /**
     * Remove all members in a sorted set within the given indexes.
     */
    zremrangebyrank(key: string, start: number, stop: number): PromiseWithNull<number>;
    ZREMRANGEBYRANK(key: string, start: number, stop: number): PromiseWithNull<number>;

    /**
     * Remove all members in a sorted set within the given indexes.
     */
    zremrangebyscore(
      key: string,
      min: string | number,
      max: string | number,
    ): PromiseWithNull<number>;
    ZREMRANGEBYSCORE(
      key: string,
      min: string | number,
      max: string | number,
    ): PromiseWithNull<number>;

    /**
     * Return a range of members in a sorted set, by index, with scores ordered from high to low.
     */
    zrevrange(key: string, start: number, stop: number): PromiseWithNull<string[]>;
    zrevrange(
      key: string,
      start: number,
      stop: number,
      withscores: string,
    ): PromiseWithNull<string[]>;
    ZREVRANGE(key: string, start: number, stop: number): PromiseWithNull<string[]>;
    ZREVRANGE(
      key: string,
      start: number,
      stop: number,
      withscores: string,
    ): PromiseWithNull<string[]>;

    /**
     * Return a range of members in a sorted set, by score, with scores ordered from high to low.
     */
    zrevrangebyscore(
      key: string,
      min: number | string,
      max: number | string,
    ): PromiseWithNull<string[]>;
    zrevrangebyscore(
      key: string,
      min: number | string,
      max: number | string,
      withscores: string,
    ): PromiseWithNull<string[]>;
    zrevrangebyscore(
      key: string,
      min: number | string,
      max: number | string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;
    zrevrangebyscore(
      key: string,
      min: number | string,
      max: number | string,
      withscores: string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;
    ZREVRANGEBYSCORE(
      key: string,
      min: number | string,
      max: number | string,
    ): PromiseWithNull<string[]>;
    ZREVRANGEBYSCORE(
      key: string,
      min: number | string,
      max: number | string,
      withscores: string,
    ): PromiseWithNull<string[]>;
    ZREVRANGEBYSCORE(
      key: string,
      min: number | string,
      max: number | string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;
    ZREVRANGEBYSCORE(
      key: string,
      min: number | string,
      max: number | string,
      withscores: string,
      limit: string,
      offset: number,
      count: number,
    ): PromiseWithNull<string[]>;

    /**
     * Determine the index of a member in a sorted set, with scores ordered from high to low.
     */
    zrevrank(key: string, member: string): PromiseWithNull<number>;
    ZREVRANK(key: string, member: string): PromiseWithNull<number>;

    /**
     * Get the score associated with the given member in a sorted set.
     */
    zscore(key: string, member: string): PromiseWithNull<string>;
    ZSCORE(key: string, member: string): PromiseWithNull<string>;
  }
}
