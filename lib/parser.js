"use strict";

var esprima = require('esprima');
var _ = require('underscore');

function Parser() {
}
module.exports = Parser;

Parser.prototype.parse = function (code) {
  var tree = esprima.parse(code, { loc: true });
  return this.parseProgramOrBlock(tree);
  //console.log(tree);
  //traverse(tree, functionVisitor);
  //return list;
}

Parser.prototype.parseProgramOrBlock = function (node) {
  if (node.type !== 'Program'
      && node.type !== 'BlockStatement'
      && node.type !== 'ClassBody') {
    return []; 
  }

  var list = [];
  var body = node.body;
  for (var i = 0; i < body.length; i++) {
    var subnode = body[i]; 

    if (subnode.type === 'FunctionDeclaration') {
      // 函数定义 
      list = list.concat(this.parseFunction(subnode));
    } else if (subnode.type === 'VariableDeclaration') {
      // 变量定义 
      list = list.concat(this.parseVariable(subnode));
    } else if (subnode.type === 'ExpressionStatement') {
      // 表达式 
      list = list.concat(this.parseExpression(subnode));
    } else if (subnode.type === 'ClassDeclaration') {
      // 类 
      list = list.concat(this.parseClass(subnode));
    } else if (subnode.type === 'MethodDefinition') {
      // 方法定义 
      list = list.concat(this.parseMethod(subnode));
    }
  }

  return list;
}

Parser.prototype.parseFunction = function (node) {
  if (node.type !== 'FunctionDeclaration'
      && node.type !== 'MethodDefinition') {
    return []; 
  }

  var list = [];
  list.push({name: node.id.name, line: node.loc.start.line});

  var body = node.body;
  if (body.type === 'BlockStatement') {
    list = list.concat(this.parseProgramOrBlock(body)); 
  } else {
    //console.log('parseFunction unknown type ' + body.type); 
  }

  return list;
}

Parser.prototype.parseVariable = function (node) {
  if (node.type !== 'VariableDeclaration'
      && node.type !== 'VariableDeclarator') {
    return []; 
  }

  var list = [];
  if (node.declarations) {
    for (var i = 0; i < node.declarations.length; i++) {
      var decl = node.declarations[i];
      list = list.concat(this.parseVariable(decl)); 
    }
  } else {
    list.push({name : node.id.name, line : node.loc.start.line}); 

    var init = node.init;
    if (init.type == 'ObjectExpression') {
      list = list.concat(this.parseObject(init)); 
    } else {
      //console.log('parseVariable unknown type ' + init.type); 
    }
  }

  return list;
}

Parser.prototype.parseObject = function (node) {
  if (node.type !== 'ObjectExpression') {
    return []; 
  }

  var list = [];
  var properties = node.properties;
  for (var i = 0; i < properties.length; i++) {
    var property = properties[i]; 
    var key = property.key;
    var value = property.value;
    list.push({name : key.name || key.value, line : key.loc.start.line}); 

    if (value.type === 'ObjectExpression') {
      list = list.concat(this.parseObject(value)); 
    }
  }

  return list;
}

Parser.prototype.parseExpression = function (node) {
  if (node.type !== 'ExpressionStatement') {
    return []; 
  }

  var list = [];
  var expression = node.expression;
  if (expression.type === 'CallExpression') {
    // do nothing 
  } else if (expression.type === 'AssignmentExpression') {
    // 找到  
    var left = expression.left;
    var right = expression.right;

    if (left.property) {
      list.push({name : left.property.name, line : left.property.loc.start.line});
    }

    if (right.type === 'ObjectExpression') {
      list = list.concat(this.parseObject(right)); 
    }
  }

  return list;
}

Parser.prototype.parseClass = function (node) {
  if (node.type !== 'ClassDeclaration') {
    return []; 
  }

  //console.log('parseClass', node);

  var list = [];
  list.push({name: node.id.name, line: node.loc.start.line});

  var body = node.body;

  //console.log('class body', body);
  if (body.type == 'ClassBody') {
    list = list.concat(this.parseProgramOrBlock(body));  
  } else {
  
  }

  return list;
}

Parser.prototype.parseMethod = function (node) {

  var list = [];
  var key = node.key;
  //console.log('parseMethod', key);
  //var value = property.value;
  list.push({name : key.name || key.value, line : key.loc.start.line}); 

  return list;
}

