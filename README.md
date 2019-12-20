
MyJQL
=============

A library to simplify the usage of `mysql` module by chainning differents methods to construct a query and then execute it.

We provide the CRUD utils functions: `SELECT`, `INSERT`, `UPDATE` and `DELETE`.



Installation
------------

To use with node:

```bash
$ npm install --save myjql
```



Usage
-----------------

```javascript
...
const myjql = require('myjql');
...
```


### Connecting to MySQL Database


```javascript
...
myjql.connect({    // Return object same as `createConnection` 
                    // of the module `mysql`
                    // You can work with as you are working `mysql`
                    // Same as `createConnection`
        "host"      :   "localhost", 
        "user"      :   "root", 
        "password"  :   "root", 
        "database"  :   "randomDB"
    });
...
```


### SELECT Query


```javascript
...
let selectFromQuery = myjql.Query
    .select('colA, colB')       // String of cols with `,` between each col
 // .select(['colA', 'colB'])   // Or an Array that contains different cols
    .from('tableA')             // Table as string (Only string is supported)
    .where()
        .attr('age')
            .gte(25)
//  .where()
//      .attr('age')
//          .gt(25)
//  .where()
//      .attr('age')
//          .lte(25)
//  .where()
//      .attr('age')
//          .lt(25)
//  .where()
//      .attr('age')
//          .equals(25)
    .and()
        .attr('name')
            .like('%somename')
    .and()
        .attr("something")
            .eq()               // If nothing given, it replace it by '?'
    .exec(["18"]);              // Data given in order to replace the '?' value
                                // in the same order of the 'attr'
...
```


### INSERT Query


```javascript
...
let insertIntoQuery = myjql.Query
    .insert('tableA')                   // Table as string (Only string is supported)
        .cols('colA, colB, colC')       // String of cols with `,` between each col
//      .cols(['colA', 'colB', 'colC']) // Or an Array that contains different cols
        .values([                       // Array of string
            '\'Value1\', \'Something\', 25', 
            '\'Value2\', \'Something\', 25', 
            '\'Value3\', \'Something\', 25', 
        ])
        .exec();
...
```


### UPDATE Query


```javascript
...
let updateQuery = myjql.Query
    .update('tableA')                           // Table as string (Only string is supported)
        .set('onlyOneColName', 'theNewValue')   // Set the col and its value
                                                // If a string given in 1st arg, 
                                                // then the second arg its value is '?'
//      .set([                                  // If a lot values must be changed,
//          { column: 'colA', value: 'NewValue' }
//          { column: 'colB', value: 25 }
//          { column: 'colC', value: true }
//      ])                                      // you can give like this
        .where()                                // You can also chain it with where
            .attr('colId')
                .equal(25)
        .exec();
...
```


### DELETE Query


```javascript
...
let deleteFromQuery = myjql.Query
    .delete('tableName')                        // Table as string (Only string is supported)
    .where()
        .attr('idColumn')
            .equal(20);
    .exec();
// Or
deleteFromQuery = myjql.Query
    .delete()
        .from('tableName')
    .where()
        .attr('idColumn')
            .equal(20);
    .exec();
...
```


### From Query To String


```javascript
...
// If you want to get the query string
let query = myjql.Query
    .select("*")
        .from("tableName");
query.toString();   // 'SELECT * FROM tableName'
...
```


### Create an Query Object from my own query String


```javascript
...
// If you have your own query string
let ownQuery = myjql.Query.of("...");
```



Security issues
-----------------------------------



Security issues should be reported through GitHub by opening a GitHub issue 
simply asking or by emailing the module's author/contributors.

An ideal report would include a clear indication of what the security issue is
and how it would be exploited.



Contributing
-----------------------------------



This project welcomes contributions from the community. Contributions are
accepted using GitHub pull requests. If you're not familiar with making
GitHub pull requests, please refer to the
[GitHub documentation "Creating a pull request"](https://help.github.com/articles/creating-a-pull-request/).
