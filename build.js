import _                        from 'lodash';
import connection               from 'mysql';


var My = Object.seal({
    SQL: null
});

export default function connect(connectionConfig) {
    return My.SQL = connection.createConnection(connectionConfig)
}

function query() {
    return My.SQL.query;
}

function throwErrorWrongArgs() {
    throw new Error("Wrong args given !");
}

function count(table) {
    return new Promise((resolve, reject) => {
        query(`SELECT COUNT(*) as ${ ALIAS.COUNT } FROM ${ table }`, (error, result, fields) => {
            if(error) 
                reject(error);
            resolve(result[0][ALIAS.COUNT]);
        });
    });
}

const ALIAS = {
    LENGTH: '__length__', 
    COUNT:  '__count__', 
    PAGE:   '__page__', 
    SIZE:   '__size__', 
    SORT:   '__sort__'
};

export const ORDER = {
    ASC:    "ASC", 
    DESC:   "DESC", 
};

export function execute(query, args) {
    return new Promise((resolve, reject) => {
        query(query._query, args, async (error, result, fields) => {
            if(error) 
                reject(error);
            console.log(query._query);
            resolve({
                data:           result, 
                [ALIAS.LENGTH]: result.length, 
                [ALIAS.COUNT]:  await count(query._table), 
                [ALIAS.PAGE]:   query._page, 
                [ALIAS.SIZE]:   query._size, 
                [ALIAS.SORT]:   query._sort
            });
        });
    });
}


// CREATING A QUERY
//////////////////////////////////////////////////////
export class Query {

    constructor(query, col = []) {
        this._operation = null;     // Operation (SELECT, UPDATE, DELETE, INSERT)
        switch(false) {
            case _.isArray(col): 
            case _.isString(query): 
                throwErrorWrongArgs();
        }
        this._query = query;        // String
        this._col   = col;          // Array of String
        this._table = '';           // String
        this._page  = 0;            // Number
        this._size  = null;         // Number
        this._sort  = ORDER.ASC;    // Oreder enum
        this._where = null;         // Where instance
    }

    static ['of'](query) {
        return new Query(query);
    }

    static select(cols = '*') {
        let 
            columns = [], 
            query = 'SELECT';
        this._operation = 'SELECT';
        switch(true) {
            case _.isArray(cols):
            case _.isString(cols):
                columns = _.flattenDepth([cols], Infinity);
                break;
            default: 
                throwErrorWrongArgs();
        }
        query += ' ' + columns.reduce((acc, val) => (acc ? ', ': '') + val, null);
        return new Select(new Query(query, columns));
    }

    static insert(table) {
        let query = new Query("INSERT INTO ");
        query._operation = "INSERT";
        switch(true) {
            case _.isString(table): 
                query._query += (query._table = table) + " ";
            default: 
                throwErrorWrongArgs();
        }
        return new Insert(query);
    }

    static update(table) {
        let query = new Query('UPDATE ');
        this._operation = 'UPDATE';
        switch(true) {
            case _.isString(table): 
                query._table = table;
                break;
            default: 
                throwErrorWrongArgs();
        }
        query._query += table + ' ';
        return new Update(query);
    }

    static delete(table) {
        let deleteFrom = new Delete(this._query);
        this._operation = 'DELETE';
        switch(true) {
            case _.isString(table):
                return deleteFrom.from(table);
            default: 
                return deleteFrom;
        }
    }

    where() {
        /**
         *  @returns        Query instance | Where instance
         */
        if(!this._where)
            return this._where = new Where(this);
        return this;
    }

    and() {
        /**
         *  @returns        Query instance | Where instance
         */
        if(this._where) {
            this._query += ' AND ';
            return this._where;
        } 
        return this;
    }

    limit(arg1 = { page: 1, size: null }, arg2) {
        /**
         *  @argument       arg1
         *  @type           number | { page: number, size: number }
         *  @returns        Query instance
         *  
         *  ----------------
         *  
         *  @argument       arg2
         *  @type           number
         *  @returns        Query instance
         */
        this._size = +arg1.size || Number(arg1) || +this._size;
        this._page = (Number(arg2) || +arg1.page || +this._page) - 1;
        switch(true) {
            case this._page < 0: 
            case this._size <= 0: 
                this._page = 1;
                this._size = null;
                break;
            case _.isNumber(this._size) && _.isNumber(this._page): 
                this._query += ` LIMIT ${ this._page * this._size + ',' + this._size }`;
        }
        return this;
    }

    sort(col, order) {
        /**
         *  @argument       col
         *  @type           string | Array<string>
         *  @returns        Query instance
         *  
         *  ----------------
         *  
         *  @argument       order
         *  @type           ORDER enum values | { sort: ORDER enum values }
         *  @returns        Query instance
         */
        let 
            column      = '', 
            sortOrder   = _.isObject(order) ? order.sort : ORDER.ASC;
        switch(true) {
            case _.isArray(col):
                col = col.reduce((acc, c) => acc + ', ' + c, '');
            case _.isString(col):
                column += col;
                break;
            default:
                throwErrorWrongArgs();
        }
        this._sort = sortOrder;
        this._query += ` ORDER BY ${ column + ' ' + this._sort }`;
        return this;
    }

    sortAsc(col) {
        /**
         *  @argument       col
         *  @type           string | Array<string>
         *  @returns        Query instance
         */
        return this.sort(col, ORDER.ASC);
    }

    sortDesc(col) {
        /**
         *  @argument       col
         *  @type           string | Array<string>
         *  @returns        Query instance
         */
        return this.sort(col, ORDER.DESC);
    }

    exec(arg) {
        /**
         *  @argument       arg
         *  @type           string | number | boolean | Array<string | number | boolean | Array<...>>
         *  @returns        
         */
        let array = [];
        switch(true) {
            case _.isString(arg): 
            case _.isNumber(arg): 
            case _.isBoolean(arg): 
            case _.isArray(arg): 
                array = _.flattenDepth([arg], Infinity);
                break;
        }
        return execute(this, array);
    }

    toString() {
        /**
         *  @returnsstring
         */
        return this._query;
    }
    
}
//////////////////////////////////////////////////////

// SELECT
//////////////////////////////////////////////////////
class Select {

    constructor(query) {
        /**
         *  @argument       query
         *  @type           Query instance
         */
        this._query = query;
    }

    from(table) {
        /**
         *  @argument       table
         *  @type           string | number | boolean
         *  @returns        Query instance
         */
        switch(true) {
            case _.isBoolean(table): 
            case _.isNumber(table): 
            case _.isString(table): 
                this._query._table = String(table);
                this._query._query += ' FROM ' + this._query._table;
                break;
            default: 
                throwErrorWrongArgs();
        }
        return this._query;
    }
    
}

class Where {

    constructor(query) {
        /**
         *  @argument       query
         *  @type           Query instance
         */
        this._query = query;
        this._query._query += ' WHERE ';
    }

    attr(col) {
        /**
         *  @argument       col
         *  @type           string
         *  @returns        Statment instance
         */
        switch(true) {
            case _.isString(col): 
                this._query._query += `${ col }`;
                break;
            default: 
                throwErrorWrongArgs();
        }
        return new Statment(this._query);
    }
    
}

class Statment {

    constructor(query) {
        /**
         *  @argument       query
         *  @type           Query instance
         */
        this._query = query;
    }

    eq(val) {
        /**
         *  @argument       val
         *  @type           number | string | boolean
         *  @returns        Query instance
         */
        let value = '?';
        switch(true) {
            case _.isNumber(val): 
            case _.isBoolean(val): 
                value = val;
                break;
            case _.isString(val): 
                value = `'${ val }'`;
                break;
            default: 
                throwErrorWrongArgs();
        }
        this._query._query += ` = ${ value }`;
        return this._query;
    }

    equals(val) {
        /**
         *  @argument       val
         *  @type           number | string | boolean
         *  @returns        Query instance
         */
        return this.eq(val);
    }

    gt(val, equal) {
        /**
         *  @argument       val
         *  @type           number | string
         *  @returns        Query instance
         *  
         *  ----------------
         *  
         *  @argument       equal
         *  @type           boolean
         *  @returns        Query instance
         */
        let value = '?';
        switch(true) {
            case _.isString(val) && !Number.isNaN(val): 
            case _.isNumber(val): 
                value = val;
                break;
            default: 
                throwErrorWrongArgs();
        }
        this._query._query += ` >${ equal ? '=' : '' } ${ value }`;
        return this._query;
    }

    gte(val) {
        /**
         *  @argument       val
         *  @type           number | string
         *  @returns        Query instance
         */
        return this.gt(val, true);
    }

    lt(val, equal) {
        /**
         *  @argument       val
         *  @type           number | string
         *  @returns        Query instance
         *  
         *  ----------------
         *  
         *  @argument       equal
         *  @type           boolean
         *  @returns        Query instance
         */
        let value = '?';
        switch(true) {
            case _.isString(val) && !Number.isNaN(val): 
            case _.isNumber(val): 
                value = val;
                break;
            default: 
                throwErrorWrongArgs();
        }
        this._query._query += ` <${ equal ? '=' : '' } ${ value }`;
        return this._query;
    }

    lte(val) {
        /**
         *  @argument       val
         *  @type           number | string
         *  @returns        Query instance
         */
        return this.lt(val, true);
    }

    like(val) {
        /**
         *  @argument       val
         *  @type           number | string | boolean
         *  @returns        Query instance
         */
        let value = '?';
        switch(true) {
            case _.isNumber(val): 
            case _.isBoolean(val): 
            case _.isString(val): 
                value = `'${ val }'`;
                break;
            default: 
                throwErrorWrongArgs();
        }
        this._query._query += ` LIKE ${ value }`;
        return this._query;
    }
    
}
//////////////////////////////////////////////////////

// INSERT
//////////////////////////////////////////////////////
class Insert {

    constructor(query) {
        /**
         *  @argument       query
         *  @type           Query instance
         */
        this._query = query;
    }

    cols(columns) {
        /**
         *  @argument       columns
         *  @type           string | Array<string>
         *  @returns        Insert instance
         */
        let cols = [];
        switch(true) {
            case _.isString(columns): 
                cols = columns.split(/,\s?/g);
            case _.isArray(columns): 
                this._query._col += `(${ cols.join(", ") }) `;
                break;
            default: 
                throwErrorWrongArgs();
        }
        return this;
    }

    values(...columnValues) {
        /**
         *  @argument       columnValues
         *  @type           string
         *  @returns        Query instance
         */
        this._query._query += "VALUES ";
        columnValues.forEach((value, index, array) => {
            this._query._query += `(${ value.join(', ') })${ index + 1 != array.length ? ', ' : ''}`;
        });
        return this._query;
    }

}
//////////////////////////////////////////////////////

// UPDATE
//////////////////////////////////////////////////////
class Update {

    constructor(query) {
        /**
         *  @argument       query
         *  @type           Query instance
         */
        this._query = query;
        this._query._query += 'SET ';
    }

    set(col, val = '?') {
        /**
         *  @argument       col
         *  @type           Array<{ column: string, value: any }> | string
         *  @returns        Query instance
         *  
         *  ---------------
         *  
         *  @argument       val
         *  @type           any
         *  @returns        Query instance
         */
        let columns = [];
        switch(true) {
            case _.isString(col):
                columns = [
                    {
                        column: col, 
                        value:  _.isString(val) ? `'${ val }'` : val
                    }
                ]; 
                break;
            case _.isObject(col): 
                for(let column in col)
                    if(!col[column]) 
                        continue;
                    columns.push({
                        column, 
                        value:  _.isString(col[column]) ? `'${ col[column] }'` : col[column]
                    });
                break;
            default: 
                throwErrorWrongArgs();
        }
        this._query._query += columns.reduce((acc, item) => `${ acc ? acc + ', ' : '' }${ item.column } = ${ item.value }`, null);
        return this._query;
    }
    
}
//////////////////////////////////////////////////////

// DELETE
//////////////////////////////////////////////////////
class Delete {

    constructor(query) {
        /**
         *  @argument       query
         *  @type           Query isntance
         */
        this._query = query;
        this._query._query = 'DELETE ';
    }

    from(table) {
        /**
         *  @argument       table
         *  @type           string | number | boolean
         *  @returns        Query instance
         */
        switch(true) {
            case _.isBoolean(table): 
            case _.isNumber(table): 
            case _.isString(table): 
                this._query._table = String(table);
                this._query._query += '`' + this._query._table + '` ';
                break;
            default: 
                throwErrorWrongArgs();
        }
        return this._query;
    }
    
}
//////////////////////////////////////////////////////
