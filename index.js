"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = connect;
exports.execute = execute;
exports.Query = exports.ORDER = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _mysql = _interopRequireDefault(require("mysql"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var My = Object.seal({
  SQL: null
});

function connect(connectionConfig) {
  return My.SQL = _mysql["default"].createConnection(connectionConfig);
}

function query() {
  return My.SQL.query;
}

function throwErrorWrongArgs() {
  throw new Error("Wrong args given !");
}

function count(table) {
  return new Promise(function (resolve, reject) {
    query("SELECT COUNT(*) as ".concat(ALIAS.COUNT, " FROM ").concat(table), function (error, result, fields) {
      if (error) reject(error);
      resolve(result[0][ALIAS.COUNT]);
    });
  });
}

var ALIAS = {
  LENGTH: '__length__',
  COUNT: '__count__',
  PAGE: '__page__',
  SIZE: '__size__',
  SORT: '__sort__'
};
var ORDER = {
  ASC: "ASC",
  DESC: "DESC"
};
exports.ORDER = ORDER;

function execute(query, args) {
  return new Promise(function (resolve, reject) {
    query(query._query, args, function _callee(error, result, fields) {
      var _resolve;

      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (error) reject(error);
              console.log(query._query);
              _context.t0 = resolve;
              _resolve = {
                data: result
              };

              _defineProperty(_resolve, ALIAS.LENGTH, result.length);

              _context.t1 = _defineProperty;
              _context.t2 = _resolve;
              _context.t3 = ALIAS.COUNT;
              _context.next = 10;
              return regeneratorRuntime.awrap(count(query._table));

            case 10:
              _context.t4 = _context.sent;
              (0, _context.t1)(_context.t2, _context.t3, _context.t4);

              _defineProperty(_resolve, ALIAS.PAGE, query._page);

              _defineProperty(_resolve, ALIAS.SIZE, query._size);

              _defineProperty(_resolve, ALIAS.SORT, query._sort);

              _context.t5 = _resolve;
              (0, _context.t0)(_context.t5);

            case 17:
            case "end":
              return _context.stop();
          }
        }
      });
    });
  });
} // CREATING A QUERY
//////////////////////////////////////////////////////


var Query =
/*#__PURE__*/
function () {
  function Query(query) {
    var col = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, Query);

    this._operation = null; // Operation (SELECT, UPDATE, DELETE, INSERT)

    switch (false) {
      case _lodash["default"].isArray(col):
      case _lodash["default"].isString(query):
        throwErrorWrongArgs();
    }

    this._query = query; // String

    this._col = col; // Array of String

    this._table = ''; // String

    this._page = 0; // Number

    this._size = null; // Number

    this._sort = ORDER.ASC; // Oreder enum

    this._where = null; // Where instance
  }

  _createClass(Query, [{
    key: "where",
    value: function where() {
      if (!this._where) return this._where = new Where(this);
      return this;
    }
  }, {
    key: "and",
    value: function and() {
      if (this._where) {
        this._query += ' AND ';
        return this._where;
      }

      return this;
    }
  }, {
    key: "limit",
    value: function limit() {
      var arg1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        page: 1,
        size: null
      };
      var arg2 = arguments.length > 1 ? arguments[1] : undefined;
      this._size = +arg1.size || Number(arg1) || +this._size;
      this._page = (Number(arg2) || +arg1.page || +this._page) - 1;

      switch (true) {
        case this._page < 0:
        case this._size <= 0:
          this._page = 1;
          this._size = null;
          break;

        case _lodash["default"].isNumber(this._size) && _lodash["default"].isNumber(this._page):
          this._query += " LIMIT ".concat(this._page * this._size + ',' + this._size);
      }

      return this;
    }
  }, {
    key: "sort",
    value: function sort(col, order) {
      var column = '',
          sortOrder = _lodash["default"].isObject(order) ? order.sort : ORDER.ASC;

      switch (true) {
        case !col || !_lodash["default"].includes(ORDER, order):
          return this;

        case _lodash["default"].isArray(col):
          col = col.reduce(function (acc, c) {
            return acc + ', ' + c;
          }, '');

        case _lodash["default"].isString(col):
          column += col;
          break;

        default:
          throwErrorWrongArgs();
      }

      this._sort = sortOrder;
      this._query += " ORDER BY ".concat(column + ' ' + this._sort);
      return this;
    }
  }, {
    key: "sortAsc",
    value: function sortAsc(col) {
      return this.sort(col, ORDER.ASC);
    }
  }, {
    key: "sortDesc",
    value: function sortDesc(col) {
      return this.sort(col, ORDER.DESC);
    }
  }, {
    key: "exec",
    value: function exec(arg) {
      var array = [];

      switch (true) {
        case _lodash["default"].isString(arg):
        case _lodash["default"].isNumber(arg):
        case _lodash["default"].isBoolean(arg):
        case _lodash["default"].isArray(arg):
          array = _lodash["default"].flattenDepth([arg], Infinity);
          break;
      }

      return execute(this, array);
    }
  }, {
    key: "toString",
    value: function toString() {
      return this._query;
    }
  }], [{
    key: 'of',
    value: function of(query) {
      return new Query(query);
    }
  }, {
    key: "select",
    value: function select() {
      var cols = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '*';
      var columns = [],
          query = 'SELECT';
      this._operation = 'SELECT';

      switch (true) {
        case _lodash["default"].isArray(cols):
        case _lodash["default"].isString(cols):
          columns = _lodash["default"].flattenDepth([cols], Infinity);
          break;

        default:
          throwErrorWrongArgs();
      }

      query += ' ' + columns.reduce(function (acc, val, index) {
        return (acc ? ', ' : '') + val;
      }, null);
      return new Select(new Query(query, columns));
    }
  }, {
    key: "insert",
    value: function insert(table) {
      var query = new Query("INSERT INTO ");
      query._operation = "INSERT";

      switch (true) {
        case _lodash["default"].isString(table):
          query._query += (query._table = table) + " ";

        default:
          throwErrorWrongArgs();
      }

      return new Insert(query);
    }
  }, {
    key: "update",
    value: function update(table) {
      var query = new Query('UPDATE ');
      this._operation = 'UPDATE';

      switch (true) {
        case _lodash["default"].isString(table):
          query._table = table;
          break;

        default:
          throwErrorWrongArgs();
      }

      query._query += table + ' ';
      return new Update(query);
    }
  }, {
    key: "delete",
    value: function _delete(table) {
      var deleteFrom = new Delete(this._query);
      this._operation = 'DELETE';

      switch (true) {
        case _lodash["default"].isString(table):
          return deleteFrom.from(table);

        default:
          return deleteFrom;
      }
    }
  }]);

  return Query;
}(); //////////////////////////////////////////////////////
// SELECT
//////////////////////////////////////////////////////


exports.Query = Query;

var Select =
/*#__PURE__*/
function () {
  function Select(query) {
    _classCallCheck(this, Select);

    this._query = query;
  }

  _createClass(Select, [{
    key: "from",
    value: function from(table) {
      switch (true) {
        case _lodash["default"].isString(table):
          this._query._table = table;
          break;

        default:
          throwErrorWrongArgs();
      }

      this._query._query += ' FROM ' + this._query._table;
      return this._query;
    }
  }]);

  return Select;
}();

var Where =
/*#__PURE__*/
function () {
  function Where(query) {
    _classCallCheck(this, Where);

    if (!query || !_lodash["default"].isObject(query)) throwErrorWrongArgs();
    this._query = query;
    this._query._query += ' WHERE ';
  }

  _createClass(Where, [{
    key: "attr",
    value: function attr(col) {
      this._query._query += "".concat(col);
      return new Statment(this);
    }
  }]);

  return Where;
}();

var Statment =
/*#__PURE__*/
function () {
  function Statment(where) {
    _classCallCheck(this, Statment);

    if (!where || !_lodash["default"].isObject(where)) throwErrorWrongArgs();
    this._where = where;
  }

  _createClass(Statment, [{
    key: "eq",
    value: function eq(val) {
      var value = '?';

      switch (true) {
        case _lodash["default"].isNumber(val):
        case _lodash["default"].isBoolean(val):
          value = val;
          break;

        case _lodash["default"].isString(val):
          value = "'".concat(val, "'");
          break;

        default:
          throwErrorWrongArgs();
      }

      this._where._query._query += " = ".concat(value);
      return this._where._query;
    }
  }, {
    key: "gt",
    value: function gt(val, equal) {
      var value = '?';

      switch (true) {
        case _lodash["default"].isString(val) && !Number.isNaN(val):
        case _lodash["default"].isNumber(val):
          value = val;
          break;

        default:
          throwErrorWrongArgs();
      }

      this._where._query._query += " >".concat(equal ? '=' : '', " ").concat(value);
      return this._where._query;
    }
  }, {
    key: "gte",
    value: function gte(val) {
      return this.gt(val, true);
    }
  }, {
    key: "lt",
    value: function lt(val, equal) {
      var value = '?';

      switch (true) {
        case _lodash["default"].isString(val) && !Number.isNaN(val):
        case _lodash["default"].isNumber(val):
          value = val;
          break;

        default:
          throwErrorWrongArgs();
      }

      this._where._query._query += " <".concat(equal ? '=' : '', " ").concat(value);
      return this._where._query;
    }
  }, {
    key: "lte",
    value: function lte(val) {
      return this.lt(val, true);
    }
  }, {
    key: "like",
    value: function like(val) {
      var value = '?';

      switch (true) {
        case _lodash["default"].isNumber(val):
        case _lodash["default"].isBoolean(val):
        case _lodash["default"].isString(val):
          value = "'".concat(val, "'");

        default:
          throwErrorWrongArgs();
      }

      this._where._query._query += " LIKE ".concat(value);
      return this._where._query;
    }
  }]);

  return Statment;
}(); //////////////////////////////////////////////////////
// INSERT
//////////////////////////////////////////////////////


var Insert =
/*#__PURE__*/
function () {
  function Insert(query) {
    _classCallCheck(this, Insert);

    this._query = query;
  }

  _createClass(Insert, [{
    key: "cols",
    value: function cols(columns) {
      switch (true) {
        case _lodash["default"].isString(columns):
          this._query._col = columns.split(/,\s?/g);

        case _lodash["default"].isArray(columns):
          this._query._query += "(".concat(this._query._col.join(", "), ") ");

        default:
          throwErrorWrongArgs();
      }
    }
  }, {
    key: "values",
    value: function values() {
      var _this = this;

      this._query._query += "VALUES ";

      for (var _len = arguments.length, columnValues = new Array(_len), _key = 0; _key < _len; _key++) {
        columnValues[_key] = arguments[_key];
      }

      columnValues.forEach(function (value, index, array) {
        _this._query._query += "(".concat(value.join(', '), ")").concat(index + 1 == array.length ? ', ' : '');
      });
      return this._query;
    }
  }]);

  return Insert;
}(); //////////////////////////////////////////////////////
// UPDATE
//////////////////////////////////////////////////////


var Update =
/*#__PURE__*/
function () {
  function Update(query) {
    _classCallCheck(this, Update);

    this._query = query;
    this._query._query += 'SET ';
  }

  _createClass(Update, [{
    key: "set",
    value: function set(col) {
      var val = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '?';
      var columns = [];

      switch (true) {
        case _lodash["default"].isString(col):
          columns = [{
            column: col,
            value: _lodash["default"].isString(val) ? "'".concat(val, "'") : val
          }];
          break;

        case _lodash["default"].isObject(col):
          for (var column in col) {
            col[column] && columns.push({
              column: column,
              value: _lodash["default"].isString(col[column]) ? "'".concat(col[column], "'") : col[column]
            });
          }

          break;

        default:
          throwErrorWrongArgs();
      }

      this._query._query += columns.reduce(function (acc, item) {
        return "".concat(acc ? acc + ', ' : '').concat(item.column, " = ").concat(item.value);
      }, null);
      return this._query;
    }
  }]);

  return Update;
}(); //////////////////////////////////////////////////////
// DELETE
//////////////////////////////////////////////////////


var Delete =
/*#__PURE__*/
function () {
  function Delete(query) {
    _classCallCheck(this, Delete);

    this._query = query;
    this._query._query = 'DELETE ';
  }

  _createClass(Delete, [{
    key: "from",
    value: function from(table) {
      switch (true) {
        case _lodash["default"].isBoolean(table):
        case _lodash["default"].isNumber(table):
        case _lodash["default"].isString(table):
          this._query._query += '`' + table + '` ';

        default:
          throwErrorWrongArgs();
      }

      this._query._table = table;
      return this._query;
    }
  }]);

  return Delete;
}(); //////////////////////////////////////////////////////
