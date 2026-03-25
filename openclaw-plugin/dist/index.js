var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/@sinclair/typebox/build/esm/type/guard/value.mjs
var value_exports = {};
__export(value_exports, {
  HasPropertyKey: () => HasPropertyKey,
  IsArray: () => IsArray,
  IsAsyncIterator: () => IsAsyncIterator,
  IsBigInt: () => IsBigInt,
  IsBoolean: () => IsBoolean,
  IsDate: () => IsDate,
  IsFunction: () => IsFunction,
  IsIterator: () => IsIterator,
  IsNull: () => IsNull,
  IsNumber: () => IsNumber,
  IsObject: () => IsObject,
  IsRegExp: () => IsRegExp,
  IsString: () => IsString,
  IsSymbol: () => IsSymbol,
  IsUint8Array: () => IsUint8Array,
  IsUndefined: () => IsUndefined
});
function HasPropertyKey(value, key) {
  return key in value;
}
function IsAsyncIterator(value) {
  return IsObject(value) && !IsArray(value) && !IsUint8Array(value) && Symbol.asyncIterator in value;
}
function IsArray(value) {
  return Array.isArray(value);
}
function IsBigInt(value) {
  return typeof value === "bigint";
}
function IsBoolean(value) {
  return typeof value === "boolean";
}
function IsDate(value) {
  return value instanceof globalThis.Date;
}
function IsFunction(value) {
  return typeof value === "function";
}
function IsIterator(value) {
  return IsObject(value) && !IsArray(value) && !IsUint8Array(value) && Symbol.iterator in value;
}
function IsNull(value) {
  return value === null;
}
function IsNumber(value) {
  return typeof value === "number";
}
function IsObject(value) {
  return typeof value === "object" && value !== null;
}
function IsRegExp(value) {
  return value instanceof globalThis.RegExp;
}
function IsString(value) {
  return typeof value === "string";
}
function IsSymbol(value) {
  return typeof value === "symbol";
}
function IsUint8Array(value) {
  return value instanceof globalThis.Uint8Array;
}
function IsUndefined(value) {
  return value === void 0;
}

// node_modules/@sinclair/typebox/build/esm/type/clone/value.mjs
function ArrayType(value) {
  return value.map((value2) => Visit(value2));
}
function DateType(value) {
  return new Date(value.getTime());
}
function Uint8ArrayType(value) {
  return new Uint8Array(value);
}
function RegExpType(value) {
  return new RegExp(value.source, value.flags);
}
function ObjectType(value) {
  const result = {};
  for (const key of Object.getOwnPropertyNames(value)) {
    result[key] = Visit(value[key]);
  }
  for (const key of Object.getOwnPropertySymbols(value)) {
    result[key] = Visit(value[key]);
  }
  return result;
}
function Visit(value) {
  return IsArray(value) ? ArrayType(value) : IsDate(value) ? DateType(value) : IsUint8Array(value) ? Uint8ArrayType(value) : IsRegExp(value) ? RegExpType(value) : IsObject(value) ? ObjectType(value) : value;
}
function Clone(value) {
  return Visit(value);
}

// node_modules/@sinclair/typebox/build/esm/type/clone/type.mjs
function CloneRest(schemas) {
  return schemas.map((schema) => CloneType(schema));
}
function CloneType(schema, options) {
  return options === void 0 ? Clone(schema) : Clone({ ...options, ...schema });
}

// node_modules/@sinclair/typebox/build/esm/value/guard/guard.mjs
function IsObject2(value) {
  return value !== null && typeof value === "object";
}
function IsArray2(value) {
  return Array.isArray(value) && !ArrayBuffer.isView(value);
}
function IsUndefined2(value) {
  return value === void 0;
}
function IsNumber2(value) {
  return typeof value === "number";
}

// node_modules/@sinclair/typebox/build/esm/system/policy.mjs
var TypeSystemPolicy;
(function(TypeSystemPolicy2) {
  TypeSystemPolicy2.InstanceMode = "default";
  TypeSystemPolicy2.ExactOptionalPropertyTypes = false;
  TypeSystemPolicy2.AllowArrayObject = false;
  TypeSystemPolicy2.AllowNaN = false;
  TypeSystemPolicy2.AllowNullVoid = false;
  function IsExactOptionalProperty(value, key) {
    return TypeSystemPolicy2.ExactOptionalPropertyTypes ? key in value : value[key] !== void 0;
  }
  TypeSystemPolicy2.IsExactOptionalProperty = IsExactOptionalProperty;
  function IsObjectLike(value) {
    const isObject = IsObject2(value);
    return TypeSystemPolicy2.AllowArrayObject ? isObject : isObject && !IsArray2(value);
  }
  TypeSystemPolicy2.IsObjectLike = IsObjectLike;
  function IsRecordLike(value) {
    return IsObjectLike(value) && !(value instanceof Date) && !(value instanceof Uint8Array);
  }
  TypeSystemPolicy2.IsRecordLike = IsRecordLike;
  function IsNumberLike(value) {
    return TypeSystemPolicy2.AllowNaN ? IsNumber2(value) : Number.isFinite(value);
  }
  TypeSystemPolicy2.IsNumberLike = IsNumberLike;
  function IsVoidLike(value) {
    const isUndefined = IsUndefined2(value);
    return TypeSystemPolicy2.AllowNullVoid ? isUndefined || value === null : isUndefined;
  }
  TypeSystemPolicy2.IsVoidLike = IsVoidLike;
})(TypeSystemPolicy || (TypeSystemPolicy = {}));

// node_modules/@sinclair/typebox/build/esm/type/create/immutable.mjs
function ImmutableArray(value) {
  return globalThis.Object.freeze(value).map((value2) => Immutable(value2));
}
function ImmutableDate(value) {
  return value;
}
function ImmutableUint8Array(value) {
  return value;
}
function ImmutableRegExp(value) {
  return value;
}
function ImmutableObject(value) {
  const result = {};
  for (const key of Object.getOwnPropertyNames(value)) {
    result[key] = Immutable(value[key]);
  }
  for (const key of Object.getOwnPropertySymbols(value)) {
    result[key] = Immutable(value[key]);
  }
  return globalThis.Object.freeze(result);
}
function Immutable(value) {
  return IsArray(value) ? ImmutableArray(value) : IsDate(value) ? ImmutableDate(value) : IsUint8Array(value) ? ImmutableUint8Array(value) : IsRegExp(value) ? ImmutableRegExp(value) : IsObject(value) ? ImmutableObject(value) : value;
}

// node_modules/@sinclair/typebox/build/esm/type/create/type.mjs
function CreateType(schema, options) {
  const result = options !== void 0 ? { ...options, ...schema } : schema;
  switch (TypeSystemPolicy.InstanceMode) {
    case "freeze":
      return Immutable(result);
    case "clone":
      return Clone(result);
    default:
      return result;
  }
}

// node_modules/@sinclair/typebox/build/esm/type/error/error.mjs
var TypeBoxError = class extends Error {
  constructor(message) {
    super(message);
  }
};

// node_modules/@sinclair/typebox/build/esm/type/symbols/symbols.mjs
var TransformKind = /* @__PURE__ */ Symbol.for("TypeBox.Transform");
var ReadonlyKind = /* @__PURE__ */ Symbol.for("TypeBox.Readonly");
var OptionalKind = /* @__PURE__ */ Symbol.for("TypeBox.Optional");
var Hint = /* @__PURE__ */ Symbol.for("TypeBox.Hint");
var Kind = /* @__PURE__ */ Symbol.for("TypeBox.Kind");

// node_modules/@sinclair/typebox/build/esm/type/guard/kind.mjs
function IsReadonly(value) {
  return IsObject(value) && value[ReadonlyKind] === "Readonly";
}
function IsOptional(value) {
  return IsObject(value) && value[OptionalKind] === "Optional";
}
function IsAny(value) {
  return IsKindOf(value, "Any");
}
function IsArray3(value) {
  return IsKindOf(value, "Array");
}
function IsAsyncIterator2(value) {
  return IsKindOf(value, "AsyncIterator");
}
function IsBigInt2(value) {
  return IsKindOf(value, "BigInt");
}
function IsBoolean2(value) {
  return IsKindOf(value, "Boolean");
}
function IsConstructor(value) {
  return IsKindOf(value, "Constructor");
}
function IsDate2(value) {
  return IsKindOf(value, "Date");
}
function IsFunction2(value) {
  return IsKindOf(value, "Function");
}
function IsInteger(value) {
  return IsKindOf(value, "Integer");
}
function IsIntersect(value) {
  return IsKindOf(value, "Intersect");
}
function IsIterator2(value) {
  return IsKindOf(value, "Iterator");
}
function IsKindOf(value, kind) {
  return IsObject(value) && Kind in value && value[Kind] === kind;
}
function IsLiteral(value) {
  return IsKindOf(value, "Literal");
}
function IsMappedKey(value) {
  return IsKindOf(value, "MappedKey");
}
function IsMappedResult(value) {
  return IsKindOf(value, "MappedResult");
}
function IsNever(value) {
  return IsKindOf(value, "Never");
}
function IsNot(value) {
  return IsKindOf(value, "Not");
}
function IsNull2(value) {
  return IsKindOf(value, "Null");
}
function IsNumber3(value) {
  return IsKindOf(value, "Number");
}
function IsObject3(value) {
  return IsKindOf(value, "Object");
}
function IsPromise(value) {
  return IsKindOf(value, "Promise");
}
function IsRecord(value) {
  return IsKindOf(value, "Record");
}
function IsRef(value) {
  return IsKindOf(value, "Ref");
}
function IsRegExp2(value) {
  return IsKindOf(value, "RegExp");
}
function IsString2(value) {
  return IsKindOf(value, "String");
}
function IsSymbol2(value) {
  return IsKindOf(value, "Symbol");
}
function IsTemplateLiteral(value) {
  return IsKindOf(value, "TemplateLiteral");
}
function IsThis(value) {
  return IsKindOf(value, "This");
}
function IsTransform(value) {
  return IsObject(value) && TransformKind in value;
}
function IsTuple(value) {
  return IsKindOf(value, "Tuple");
}
function IsUndefined3(value) {
  return IsKindOf(value, "Undefined");
}
function IsUnion(value) {
  return IsKindOf(value, "Union");
}
function IsUint8Array2(value) {
  return IsKindOf(value, "Uint8Array");
}
function IsUnknown(value) {
  return IsKindOf(value, "Unknown");
}
function IsUnsafe(value) {
  return IsKindOf(value, "Unsafe");
}
function IsVoid(value) {
  return IsKindOf(value, "Void");
}
function IsKind(value) {
  return IsObject(value) && Kind in value && IsString(value[Kind]);
}
function IsSchema(value) {
  return IsAny(value) || IsArray3(value) || IsBoolean2(value) || IsBigInt2(value) || IsAsyncIterator2(value) || IsConstructor(value) || IsDate2(value) || IsFunction2(value) || IsInteger(value) || IsIntersect(value) || IsIterator2(value) || IsLiteral(value) || IsMappedKey(value) || IsMappedResult(value) || IsNever(value) || IsNot(value) || IsNull2(value) || IsNumber3(value) || IsObject3(value) || IsPromise(value) || IsRecord(value) || IsRef(value) || IsRegExp2(value) || IsString2(value) || IsSymbol2(value) || IsTemplateLiteral(value) || IsThis(value) || IsTuple(value) || IsUndefined3(value) || IsUnion(value) || IsUint8Array2(value) || IsUnknown(value) || IsUnsafe(value) || IsVoid(value) || IsKind(value);
}

// node_modules/@sinclair/typebox/build/esm/type/guard/type.mjs
var type_exports = {};
__export(type_exports, {
  IsAny: () => IsAny2,
  IsArray: () => IsArray4,
  IsAsyncIterator: () => IsAsyncIterator3,
  IsBigInt: () => IsBigInt3,
  IsBoolean: () => IsBoolean3,
  IsConstructor: () => IsConstructor2,
  IsDate: () => IsDate3,
  IsFunction: () => IsFunction3,
  IsInteger: () => IsInteger2,
  IsIntersect: () => IsIntersect2,
  IsIterator: () => IsIterator3,
  IsKind: () => IsKind2,
  IsKindOf: () => IsKindOf2,
  IsLiteral: () => IsLiteral2,
  IsLiteralBoolean: () => IsLiteralBoolean,
  IsLiteralNumber: () => IsLiteralNumber,
  IsLiteralString: () => IsLiteralString,
  IsLiteralValue: () => IsLiteralValue,
  IsMappedKey: () => IsMappedKey2,
  IsMappedResult: () => IsMappedResult2,
  IsNever: () => IsNever2,
  IsNot: () => IsNot2,
  IsNull: () => IsNull3,
  IsNumber: () => IsNumber4,
  IsObject: () => IsObject4,
  IsOptional: () => IsOptional2,
  IsPromise: () => IsPromise2,
  IsProperties: () => IsProperties,
  IsReadonly: () => IsReadonly2,
  IsRecord: () => IsRecord2,
  IsRecursive: () => IsRecursive,
  IsRef: () => IsRef2,
  IsRegExp: () => IsRegExp3,
  IsSchema: () => IsSchema2,
  IsString: () => IsString3,
  IsSymbol: () => IsSymbol3,
  IsTemplateLiteral: () => IsTemplateLiteral2,
  IsThis: () => IsThis2,
  IsTransform: () => IsTransform2,
  IsTuple: () => IsTuple2,
  IsUint8Array: () => IsUint8Array3,
  IsUndefined: () => IsUndefined4,
  IsUnion: () => IsUnion2,
  IsUnionLiteral: () => IsUnionLiteral,
  IsUnknown: () => IsUnknown2,
  IsUnsafe: () => IsUnsafe2,
  IsVoid: () => IsVoid2,
  TypeGuardUnknownTypeError: () => TypeGuardUnknownTypeError
});
var TypeGuardUnknownTypeError = class extends TypeBoxError {
};
var KnownTypes = [
  "Any",
  "Array",
  "AsyncIterator",
  "BigInt",
  "Boolean",
  "Constructor",
  "Date",
  "Enum",
  "Function",
  "Integer",
  "Intersect",
  "Iterator",
  "Literal",
  "MappedKey",
  "MappedResult",
  "Not",
  "Null",
  "Number",
  "Object",
  "Promise",
  "Record",
  "Ref",
  "RegExp",
  "String",
  "Symbol",
  "TemplateLiteral",
  "This",
  "Tuple",
  "Undefined",
  "Union",
  "Uint8Array",
  "Unknown",
  "Void"
];
function IsPattern(value) {
  try {
    new RegExp(value);
    return true;
  } catch {
    return false;
  }
}
function IsControlCharacterFree(value) {
  if (!IsString(value))
    return false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 7 && code <= 13 || code === 27 || code === 127) {
      return false;
    }
  }
  return true;
}
function IsAdditionalProperties(value) {
  return IsOptionalBoolean(value) || IsSchema2(value);
}
function IsOptionalBigInt(value) {
  return IsUndefined(value) || IsBigInt(value);
}
function IsOptionalNumber(value) {
  return IsUndefined(value) || IsNumber(value);
}
function IsOptionalBoolean(value) {
  return IsUndefined(value) || IsBoolean(value);
}
function IsOptionalString(value) {
  return IsUndefined(value) || IsString(value);
}
function IsOptionalPattern(value) {
  return IsUndefined(value) || IsString(value) && IsControlCharacterFree(value) && IsPattern(value);
}
function IsOptionalFormat(value) {
  return IsUndefined(value) || IsString(value) && IsControlCharacterFree(value);
}
function IsOptionalSchema(value) {
  return IsUndefined(value) || IsSchema2(value);
}
function IsReadonly2(value) {
  return IsObject(value) && value[ReadonlyKind] === "Readonly";
}
function IsOptional2(value) {
  return IsObject(value) && value[OptionalKind] === "Optional";
}
function IsAny2(value) {
  return IsKindOf2(value, "Any") && IsOptionalString(value.$id);
}
function IsArray4(value) {
  return IsKindOf2(value, "Array") && value.type === "array" && IsOptionalString(value.$id) && IsSchema2(value.items) && IsOptionalNumber(value.minItems) && IsOptionalNumber(value.maxItems) && IsOptionalBoolean(value.uniqueItems) && IsOptionalSchema(value.contains) && IsOptionalNumber(value.minContains) && IsOptionalNumber(value.maxContains);
}
function IsAsyncIterator3(value) {
  return IsKindOf2(value, "AsyncIterator") && value.type === "AsyncIterator" && IsOptionalString(value.$id) && IsSchema2(value.items);
}
function IsBigInt3(value) {
  return IsKindOf2(value, "BigInt") && value.type === "bigint" && IsOptionalString(value.$id) && IsOptionalBigInt(value.exclusiveMaximum) && IsOptionalBigInt(value.exclusiveMinimum) && IsOptionalBigInt(value.maximum) && IsOptionalBigInt(value.minimum) && IsOptionalBigInt(value.multipleOf);
}
function IsBoolean3(value) {
  return IsKindOf2(value, "Boolean") && value.type === "boolean" && IsOptionalString(value.$id);
}
function IsConstructor2(value) {
  return IsKindOf2(value, "Constructor") && value.type === "Constructor" && IsOptionalString(value.$id) && IsArray(value.parameters) && value.parameters.every((schema) => IsSchema2(schema)) && IsSchema2(value.returns);
}
function IsDate3(value) {
  return IsKindOf2(value, "Date") && value.type === "Date" && IsOptionalString(value.$id) && IsOptionalNumber(value.exclusiveMaximumTimestamp) && IsOptionalNumber(value.exclusiveMinimumTimestamp) && IsOptionalNumber(value.maximumTimestamp) && IsOptionalNumber(value.minimumTimestamp) && IsOptionalNumber(value.multipleOfTimestamp);
}
function IsFunction3(value) {
  return IsKindOf2(value, "Function") && value.type === "Function" && IsOptionalString(value.$id) && IsArray(value.parameters) && value.parameters.every((schema) => IsSchema2(schema)) && IsSchema2(value.returns);
}
function IsInteger2(value) {
  return IsKindOf2(value, "Integer") && value.type === "integer" && IsOptionalString(value.$id) && IsOptionalNumber(value.exclusiveMaximum) && IsOptionalNumber(value.exclusiveMinimum) && IsOptionalNumber(value.maximum) && IsOptionalNumber(value.minimum) && IsOptionalNumber(value.multipleOf);
}
function IsProperties(value) {
  return IsObject(value) && Object.entries(value).every(([key, schema]) => IsControlCharacterFree(key) && IsSchema2(schema));
}
function IsIntersect2(value) {
  return IsKindOf2(value, "Intersect") && (IsString(value.type) && value.type !== "object" ? false : true) && IsArray(value.allOf) && value.allOf.every((schema) => IsSchema2(schema) && !IsTransform2(schema)) && IsOptionalString(value.type) && (IsOptionalBoolean(value.unevaluatedProperties) || IsOptionalSchema(value.unevaluatedProperties)) && IsOptionalString(value.$id);
}
function IsIterator3(value) {
  return IsKindOf2(value, "Iterator") && value.type === "Iterator" && IsOptionalString(value.$id) && IsSchema2(value.items);
}
function IsKindOf2(value, kind) {
  return IsObject(value) && Kind in value && value[Kind] === kind;
}
function IsLiteralString(value) {
  return IsLiteral2(value) && IsString(value.const);
}
function IsLiteralNumber(value) {
  return IsLiteral2(value) && IsNumber(value.const);
}
function IsLiteralBoolean(value) {
  return IsLiteral2(value) && IsBoolean(value.const);
}
function IsLiteral2(value) {
  return IsKindOf2(value, "Literal") && IsOptionalString(value.$id) && IsLiteralValue(value.const);
}
function IsLiteralValue(value) {
  return IsBoolean(value) || IsNumber(value) || IsString(value);
}
function IsMappedKey2(value) {
  return IsKindOf2(value, "MappedKey") && IsArray(value.keys) && value.keys.every((key) => IsNumber(key) || IsString(key));
}
function IsMappedResult2(value) {
  return IsKindOf2(value, "MappedResult") && IsProperties(value.properties);
}
function IsNever2(value) {
  return IsKindOf2(value, "Never") && IsObject(value.not) && Object.getOwnPropertyNames(value.not).length === 0;
}
function IsNot2(value) {
  return IsKindOf2(value, "Not") && IsSchema2(value.not);
}
function IsNull3(value) {
  return IsKindOf2(value, "Null") && value.type === "null" && IsOptionalString(value.$id);
}
function IsNumber4(value) {
  return IsKindOf2(value, "Number") && value.type === "number" && IsOptionalString(value.$id) && IsOptionalNumber(value.exclusiveMaximum) && IsOptionalNumber(value.exclusiveMinimum) && IsOptionalNumber(value.maximum) && IsOptionalNumber(value.minimum) && IsOptionalNumber(value.multipleOf);
}
function IsObject4(value) {
  return IsKindOf2(value, "Object") && value.type === "object" && IsOptionalString(value.$id) && IsProperties(value.properties) && IsAdditionalProperties(value.additionalProperties) && IsOptionalNumber(value.minProperties) && IsOptionalNumber(value.maxProperties);
}
function IsPromise2(value) {
  return IsKindOf2(value, "Promise") && value.type === "Promise" && IsOptionalString(value.$id) && IsSchema2(value.item);
}
function IsRecord2(value) {
  return IsKindOf2(value, "Record") && value.type === "object" && IsOptionalString(value.$id) && IsAdditionalProperties(value.additionalProperties) && IsObject(value.patternProperties) && ((schema) => {
    const keys = Object.getOwnPropertyNames(schema.patternProperties);
    return keys.length === 1 && IsPattern(keys[0]) && IsObject(schema.patternProperties) && IsSchema2(schema.patternProperties[keys[0]]);
  })(value);
}
function IsRecursive(value) {
  return IsObject(value) && Hint in value && value[Hint] === "Recursive";
}
function IsRef2(value) {
  return IsKindOf2(value, "Ref") && IsOptionalString(value.$id) && IsString(value.$ref);
}
function IsRegExp3(value) {
  return IsKindOf2(value, "RegExp") && IsOptionalString(value.$id) && IsString(value.source) && IsString(value.flags) && IsOptionalNumber(value.maxLength) && IsOptionalNumber(value.minLength);
}
function IsString3(value) {
  return IsKindOf2(value, "String") && value.type === "string" && IsOptionalString(value.$id) && IsOptionalNumber(value.minLength) && IsOptionalNumber(value.maxLength) && IsOptionalPattern(value.pattern) && IsOptionalFormat(value.format);
}
function IsSymbol3(value) {
  return IsKindOf2(value, "Symbol") && value.type === "symbol" && IsOptionalString(value.$id);
}
function IsTemplateLiteral2(value) {
  return IsKindOf2(value, "TemplateLiteral") && value.type === "string" && IsString(value.pattern) && value.pattern[0] === "^" && value.pattern[value.pattern.length - 1] === "$";
}
function IsThis2(value) {
  return IsKindOf2(value, "This") && IsOptionalString(value.$id) && IsString(value.$ref);
}
function IsTransform2(value) {
  return IsObject(value) && TransformKind in value;
}
function IsTuple2(value) {
  return IsKindOf2(value, "Tuple") && value.type === "array" && IsOptionalString(value.$id) && IsNumber(value.minItems) && IsNumber(value.maxItems) && value.minItems === value.maxItems && // empty
  (IsUndefined(value.items) && IsUndefined(value.additionalItems) && value.minItems === 0 || IsArray(value.items) && value.items.every((schema) => IsSchema2(schema)));
}
function IsUndefined4(value) {
  return IsKindOf2(value, "Undefined") && value.type === "undefined" && IsOptionalString(value.$id);
}
function IsUnionLiteral(value) {
  return IsUnion2(value) && value.anyOf.every((schema) => IsLiteralString(schema) || IsLiteralNumber(schema));
}
function IsUnion2(value) {
  return IsKindOf2(value, "Union") && IsOptionalString(value.$id) && IsObject(value) && IsArray(value.anyOf) && value.anyOf.every((schema) => IsSchema2(schema));
}
function IsUint8Array3(value) {
  return IsKindOf2(value, "Uint8Array") && value.type === "Uint8Array" && IsOptionalString(value.$id) && IsOptionalNumber(value.minByteLength) && IsOptionalNumber(value.maxByteLength);
}
function IsUnknown2(value) {
  return IsKindOf2(value, "Unknown") && IsOptionalString(value.$id);
}
function IsUnsafe2(value) {
  return IsKindOf2(value, "Unsafe");
}
function IsVoid2(value) {
  return IsKindOf2(value, "Void") && value.type === "void" && IsOptionalString(value.$id);
}
function IsKind2(value) {
  return IsObject(value) && Kind in value && IsString(value[Kind]) && !KnownTypes.includes(value[Kind]);
}
function IsSchema2(value) {
  return IsObject(value) && (IsAny2(value) || IsArray4(value) || IsBoolean3(value) || IsBigInt3(value) || IsAsyncIterator3(value) || IsConstructor2(value) || IsDate3(value) || IsFunction3(value) || IsInteger2(value) || IsIntersect2(value) || IsIterator3(value) || IsLiteral2(value) || IsMappedKey2(value) || IsMappedResult2(value) || IsNever2(value) || IsNot2(value) || IsNull3(value) || IsNumber4(value) || IsObject4(value) || IsPromise2(value) || IsRecord2(value) || IsRef2(value) || IsRegExp3(value) || IsString3(value) || IsSymbol3(value) || IsTemplateLiteral2(value) || IsThis2(value) || IsTuple2(value) || IsUndefined4(value) || IsUnion2(value) || IsUint8Array3(value) || IsUnknown2(value) || IsUnsafe2(value) || IsVoid2(value) || IsKind2(value));
}

// node_modules/@sinclair/typebox/build/esm/type/patterns/patterns.mjs
var PatternBoolean = "(true|false)";
var PatternNumber = "(0|[1-9][0-9]*)";
var PatternString = "(.*)";
var PatternNever = "(?!.*)";
var PatternBooleanExact = `^${PatternBoolean}$`;
var PatternNumberExact = `^${PatternNumber}$`;
var PatternStringExact = `^${PatternString}$`;
var PatternNeverExact = `^${PatternNever}$`;

// node_modules/@sinclair/typebox/build/esm/type/sets/set.mjs
function SetIncludes(T, S) {
  return T.includes(S);
}
function SetDistinct(T) {
  return [...new Set(T)];
}
function SetIntersect(T, S) {
  return T.filter((L) => S.includes(L));
}
function SetIntersectManyResolve(T, Init) {
  return T.reduce((Acc, L) => {
    return SetIntersect(Acc, L);
  }, Init);
}
function SetIntersectMany(T) {
  return T.length === 1 ? T[0] : T.length > 1 ? SetIntersectManyResolve(T.slice(1), T[0]) : [];
}
function SetUnionMany(T) {
  const Acc = [];
  for (const L of T)
    Acc.push(...L);
  return Acc;
}

// node_modules/@sinclair/typebox/build/esm/type/any/any.mjs
function Any(options) {
  return CreateType({ [Kind]: "Any" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/array/array.mjs
function Array2(items, options) {
  return CreateType({ [Kind]: "Array", type: "array", items }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/async-iterator/async-iterator.mjs
function AsyncIterator(items, options) {
  return CreateType({ [Kind]: "AsyncIterator", type: "AsyncIterator", items }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/discard/discard.mjs
function DiscardKey(value, key) {
  const { [key]: _, ...rest } = value;
  return rest;
}
function Discard(value, keys) {
  return keys.reduce((acc, key) => DiscardKey(acc, key), value);
}

// node_modules/@sinclair/typebox/build/esm/type/never/never.mjs
function Never(options) {
  return CreateType({ [Kind]: "Never", not: {} }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/mapped/mapped-result.mjs
function MappedResult(properties) {
  return CreateType({
    [Kind]: "MappedResult",
    properties
  });
}

// node_modules/@sinclair/typebox/build/esm/type/constructor/constructor.mjs
function Constructor(parameters, returns, options) {
  return CreateType({ [Kind]: "Constructor", type: "Constructor", parameters, returns }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/function/function.mjs
function Function(parameters, returns, options) {
  return CreateType({ [Kind]: "Function", type: "Function", parameters, returns }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/union/union-create.mjs
function UnionCreate(T, options) {
  return CreateType({ [Kind]: "Union", anyOf: T }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/union/union-evaluated.mjs
function IsUnionOptional(T) {
  return T.some((L) => IsOptional(L));
}
function RemoveOptionalFromRest(T) {
  return T.map((L) => IsOptional(L) ? RemoveOptionalFromType(L) : L);
}
function RemoveOptionalFromType(T) {
  return Discard(T, [OptionalKind]);
}
function ResolveUnion(T, options) {
  return IsUnionOptional(T) ? Optional(UnionCreate(RemoveOptionalFromRest(T), options)) : UnionCreate(RemoveOptionalFromRest(T), options);
}
function UnionEvaluated(T, options) {
  return T.length === 0 ? Never(options) : T.length === 1 ? CreateType(T[0], options) : ResolveUnion(T, options);
}

// node_modules/@sinclair/typebox/build/esm/type/union/union.mjs
function Union(T, options) {
  return T.length === 0 ? Never(options) : T.length === 1 ? CreateType(T[0], options) : UnionCreate(T, options);
}

// node_modules/@sinclair/typebox/build/esm/type/template-literal/parse.mjs
var TemplateLiteralParserError = class extends TypeBoxError {
};
function Unescape(pattern) {
  return pattern.replace(/\\\$/g, "$").replace(/\\\*/g, "*").replace(/\\\^/g, "^").replace(/\\\|/g, "|").replace(/\\\(/g, "(").replace(/\\\)/g, ")");
}
function IsNonEscaped(pattern, index, char) {
  return pattern[index] === char && pattern.charCodeAt(index - 1) !== 92;
}
function IsOpenParen(pattern, index) {
  return IsNonEscaped(pattern, index, "(");
}
function IsCloseParen(pattern, index) {
  return IsNonEscaped(pattern, index, ")");
}
function IsSeparator(pattern, index) {
  return IsNonEscaped(pattern, index, "|");
}
function IsGroup(pattern) {
  if (!(IsOpenParen(pattern, 0) && IsCloseParen(pattern, pattern.length - 1)))
    return false;
  let count = 0;
  for (let index = 0; index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      count += 1;
    if (IsCloseParen(pattern, index))
      count -= 1;
    if (count === 0 && index !== pattern.length - 1)
      return false;
  }
  return true;
}
function InGroup(pattern) {
  return pattern.slice(1, pattern.length - 1);
}
function IsPrecedenceOr(pattern) {
  let count = 0;
  for (let index = 0; index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      count += 1;
    if (IsCloseParen(pattern, index))
      count -= 1;
    if (IsSeparator(pattern, index) && count === 0)
      return true;
  }
  return false;
}
function IsPrecedenceAnd(pattern) {
  for (let index = 0; index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      return true;
  }
  return false;
}
function Or(pattern) {
  let [count, start] = [0, 0];
  const expressions = [];
  for (let index = 0; index < pattern.length; index++) {
    if (IsOpenParen(pattern, index))
      count += 1;
    if (IsCloseParen(pattern, index))
      count -= 1;
    if (IsSeparator(pattern, index) && count === 0) {
      const range2 = pattern.slice(start, index);
      if (range2.length > 0)
        expressions.push(TemplateLiteralParse(range2));
      start = index + 1;
    }
  }
  const range = pattern.slice(start);
  if (range.length > 0)
    expressions.push(TemplateLiteralParse(range));
  if (expressions.length === 0)
    return { type: "const", const: "" };
  if (expressions.length === 1)
    return expressions[0];
  return { type: "or", expr: expressions };
}
function And(pattern) {
  function Group(value, index) {
    if (!IsOpenParen(value, index))
      throw new TemplateLiteralParserError(`TemplateLiteralParser: Index must point to open parens`);
    let count = 0;
    for (let scan = index; scan < value.length; scan++) {
      if (IsOpenParen(value, scan))
        count += 1;
      if (IsCloseParen(value, scan))
        count -= 1;
      if (count === 0)
        return [index, scan];
    }
    throw new TemplateLiteralParserError(`TemplateLiteralParser: Unclosed group parens in expression`);
  }
  function Range(pattern2, index) {
    for (let scan = index; scan < pattern2.length; scan++) {
      if (IsOpenParen(pattern2, scan))
        return [index, scan];
    }
    return [index, pattern2.length];
  }
  const expressions = [];
  for (let index = 0; index < pattern.length; index++) {
    if (IsOpenParen(pattern, index)) {
      const [start, end] = Group(pattern, index);
      const range = pattern.slice(start, end + 1);
      expressions.push(TemplateLiteralParse(range));
      index = end;
    } else {
      const [start, end] = Range(pattern, index);
      const range = pattern.slice(start, end);
      if (range.length > 0)
        expressions.push(TemplateLiteralParse(range));
      index = end - 1;
    }
  }
  return expressions.length === 0 ? { type: "const", const: "" } : expressions.length === 1 ? expressions[0] : { type: "and", expr: expressions };
}
function TemplateLiteralParse(pattern) {
  return IsGroup(pattern) ? TemplateLiteralParse(InGroup(pattern)) : IsPrecedenceOr(pattern) ? Or(pattern) : IsPrecedenceAnd(pattern) ? And(pattern) : { type: "const", const: Unescape(pattern) };
}
function TemplateLiteralParseExact(pattern) {
  return TemplateLiteralParse(pattern.slice(1, pattern.length - 1));
}

// node_modules/@sinclair/typebox/build/esm/type/template-literal/finite.mjs
var TemplateLiteralFiniteError = class extends TypeBoxError {
};
function IsNumberExpression(expression) {
  return expression.type === "or" && expression.expr.length === 2 && expression.expr[0].type === "const" && expression.expr[0].const === "0" && expression.expr[1].type === "const" && expression.expr[1].const === "[1-9][0-9]*";
}
function IsBooleanExpression(expression) {
  return expression.type === "or" && expression.expr.length === 2 && expression.expr[0].type === "const" && expression.expr[0].const === "true" && expression.expr[1].type === "const" && expression.expr[1].const === "false";
}
function IsStringExpression(expression) {
  return expression.type === "const" && expression.const === ".*";
}
function IsTemplateLiteralExpressionFinite(expression) {
  return IsNumberExpression(expression) || IsStringExpression(expression) ? false : IsBooleanExpression(expression) ? true : expression.type === "and" ? expression.expr.every((expr) => IsTemplateLiteralExpressionFinite(expr)) : expression.type === "or" ? expression.expr.every((expr) => IsTemplateLiteralExpressionFinite(expr)) : expression.type === "const" ? true : (() => {
    throw new TemplateLiteralFiniteError(`Unknown expression type`);
  })();
}
function IsTemplateLiteralFinite(schema) {
  const expression = TemplateLiteralParseExact(schema.pattern);
  return IsTemplateLiteralExpressionFinite(expression);
}

// node_modules/@sinclair/typebox/build/esm/type/template-literal/generate.mjs
var TemplateLiteralGenerateError = class extends TypeBoxError {
};
function* GenerateReduce(buffer) {
  if (buffer.length === 1)
    return yield* buffer[0];
  for (const left of buffer[0]) {
    for (const right of GenerateReduce(buffer.slice(1))) {
      yield `${left}${right}`;
    }
  }
}
function* GenerateAnd(expression) {
  return yield* GenerateReduce(expression.expr.map((expr) => [...TemplateLiteralExpressionGenerate(expr)]));
}
function* GenerateOr(expression) {
  for (const expr of expression.expr)
    yield* TemplateLiteralExpressionGenerate(expr);
}
function* GenerateConst(expression) {
  return yield expression.const;
}
function* TemplateLiteralExpressionGenerate(expression) {
  return expression.type === "and" ? yield* GenerateAnd(expression) : expression.type === "or" ? yield* GenerateOr(expression) : expression.type === "const" ? yield* GenerateConst(expression) : (() => {
    throw new TemplateLiteralGenerateError("Unknown expression");
  })();
}
function TemplateLiteralGenerate(schema) {
  const expression = TemplateLiteralParseExact(schema.pattern);
  return IsTemplateLiteralExpressionFinite(expression) ? [...TemplateLiteralExpressionGenerate(expression)] : [];
}

// node_modules/@sinclair/typebox/build/esm/type/literal/literal.mjs
function Literal(value, options) {
  return CreateType({
    [Kind]: "Literal",
    const: value,
    type: typeof value
  }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/boolean/boolean.mjs
function Boolean(options) {
  return CreateType({ [Kind]: "Boolean", type: "boolean" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/bigint/bigint.mjs
function BigInt(options) {
  return CreateType({ [Kind]: "BigInt", type: "bigint" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/number/number.mjs
function Number2(options) {
  return CreateType({ [Kind]: "Number", type: "number" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/string/string.mjs
function String2(options) {
  return CreateType({ [Kind]: "String", type: "string" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/template-literal/syntax.mjs
function* FromUnion(syntax) {
  const trim = syntax.trim().replace(/"|'/g, "");
  return trim === "boolean" ? yield Boolean() : trim === "number" ? yield Number2() : trim === "bigint" ? yield BigInt() : trim === "string" ? yield String2() : yield (() => {
    const literals = trim.split("|").map((literal) => Literal(literal.trim()));
    return literals.length === 0 ? Never() : literals.length === 1 ? literals[0] : UnionEvaluated(literals);
  })();
}
function* FromTerminal(syntax) {
  if (syntax[1] !== "{") {
    const L = Literal("$");
    const R = FromSyntax(syntax.slice(1));
    return yield* [L, ...R];
  }
  for (let i = 2; i < syntax.length; i++) {
    if (syntax[i] === "}") {
      const L = FromUnion(syntax.slice(2, i));
      const R = FromSyntax(syntax.slice(i + 1));
      return yield* [...L, ...R];
    }
  }
  yield Literal(syntax);
}
function* FromSyntax(syntax) {
  for (let i = 0; i < syntax.length; i++) {
    if (syntax[i] === "$") {
      const L = Literal(syntax.slice(0, i));
      const R = FromTerminal(syntax.slice(i));
      return yield* [L, ...R];
    }
  }
  yield Literal(syntax);
}
function TemplateLiteralSyntax(syntax) {
  return [...FromSyntax(syntax)];
}

// node_modules/@sinclair/typebox/build/esm/type/template-literal/pattern.mjs
var TemplateLiteralPatternError = class extends TypeBoxError {
};
function Escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Visit2(schema, acc) {
  return IsTemplateLiteral(schema) ? schema.pattern.slice(1, schema.pattern.length - 1) : IsUnion(schema) ? `(${schema.anyOf.map((schema2) => Visit2(schema2, acc)).join("|")})` : IsNumber3(schema) ? `${acc}${PatternNumber}` : IsInteger(schema) ? `${acc}${PatternNumber}` : IsBigInt2(schema) ? `${acc}${PatternNumber}` : IsString2(schema) ? `${acc}${PatternString}` : IsLiteral(schema) ? `${acc}${Escape(schema.const.toString())}` : IsBoolean2(schema) ? `${acc}${PatternBoolean}` : (() => {
    throw new TemplateLiteralPatternError(`Unexpected Kind '${schema[Kind]}'`);
  })();
}
function TemplateLiteralPattern(kinds) {
  return `^${kinds.map((schema) => Visit2(schema, "")).join("")}$`;
}

// node_modules/@sinclair/typebox/build/esm/type/template-literal/union.mjs
function TemplateLiteralToUnion(schema) {
  const R = TemplateLiteralGenerate(schema);
  const L = R.map((S) => Literal(S));
  return UnionEvaluated(L);
}

// node_modules/@sinclair/typebox/build/esm/type/template-literal/template-literal.mjs
function TemplateLiteral(unresolved, options) {
  const pattern = IsString(unresolved) ? TemplateLiteralPattern(TemplateLiteralSyntax(unresolved)) : TemplateLiteralPattern(unresolved);
  return CreateType({ [Kind]: "TemplateLiteral", type: "string", pattern }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/indexed/indexed-property-keys.mjs
function FromTemplateLiteral(T) {
  const R = TemplateLiteralGenerate(T);
  return R.map((S) => S.toString());
}
function FromUnion2(T) {
  const Acc = [];
  for (const L of T)
    Acc.push(...IndexPropertyKeys(L));
  return Acc;
}
function FromLiteral(T) {
  return [T.toString()];
}
function IndexPropertyKeys(T) {
  return [...new Set(IsTemplateLiteral(T) ? FromTemplateLiteral(T) : IsUnion(T) ? FromUnion2(T.anyOf) : IsLiteral(T) ? FromLiteral(T.const) : IsNumber3(T) ? ["[number]"] : IsInteger(T) ? ["[number]"] : [])];
}

// node_modules/@sinclair/typebox/build/esm/type/indexed/indexed-from-mapped-result.mjs
function FromProperties(T, P, options) {
  const Acc = {};
  for (const K2 of Object.getOwnPropertyNames(P)) {
    Acc[K2] = Index(T, IndexPropertyKeys(P[K2]), options);
  }
  return Acc;
}
function FromMappedResult(T, R, options) {
  return FromProperties(T, R.properties, options);
}
function IndexFromMappedResult(T, R, options) {
  const P = FromMappedResult(T, R, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/indexed/indexed.mjs
function FromRest(T, K) {
  return T.map((L) => IndexFromPropertyKey(L, K));
}
function FromIntersectRest(T) {
  return T.filter((L) => !IsNever(L));
}
function FromIntersect(T, K) {
  return IntersectEvaluated(FromIntersectRest(FromRest(T, K)));
}
function FromUnionRest(T) {
  return T.some((L) => IsNever(L)) ? [] : T;
}
function FromUnion3(T, K) {
  return UnionEvaluated(FromUnionRest(FromRest(T, K)));
}
function FromTuple(T, K) {
  return K in T ? T[K] : K === "[number]" ? UnionEvaluated(T) : Never();
}
function FromArray(T, K) {
  return K === "[number]" ? T : Never();
}
function FromProperty(T, K) {
  return K in T ? T[K] : Never();
}
function IndexFromPropertyKey(T, K) {
  return IsIntersect(T) ? FromIntersect(T.allOf, K) : IsUnion(T) ? FromUnion3(T.anyOf, K) : IsTuple(T) ? FromTuple(T.items ?? [], K) : IsArray3(T) ? FromArray(T.items, K) : IsObject3(T) ? FromProperty(T.properties, K) : Never();
}
function IndexFromPropertyKeys(T, K) {
  return K.map((L) => IndexFromPropertyKey(T, L));
}
function FromSchema(T, K) {
  return UnionEvaluated(IndexFromPropertyKeys(T, K));
}
function Index(T, K, options) {
  if (IsMappedResult(K))
    return IndexFromMappedResult(T, K, options);
  if (IsMappedKey(K))
    return IndexFromMappedKey(T, K, options);
  return CreateType(IsSchema(K) ? FromSchema(T, IndexPropertyKeys(K)) : FromSchema(T, K), options);
}

// node_modules/@sinclair/typebox/build/esm/type/indexed/indexed-from-mapped-key.mjs
function MappedIndexPropertyKey(T, K, options) {
  return { [K]: Index(T, [K], Clone(options)) };
}
function MappedIndexPropertyKeys(T, K, options) {
  return K.reduce((Acc, L) => {
    return { ...Acc, ...MappedIndexPropertyKey(T, L, options) };
  }, {});
}
function MappedIndexProperties(T, K, options) {
  return MappedIndexPropertyKeys(T, K.keys, options);
}
function IndexFromMappedKey(T, K, options) {
  const P = MappedIndexProperties(T, K, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/iterator/iterator.mjs
function Iterator(items, options) {
  return CreateType({ [Kind]: "Iterator", type: "Iterator", items }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/object/object.mjs
function RequiredKeys(properties) {
  const keys = [];
  for (let key in properties) {
    if (!IsOptional(properties[key]))
      keys.push(key);
  }
  return keys;
}
function _Object(properties, options) {
  const required = RequiredKeys(properties);
  const schematic = required.length > 0 ? { [Kind]: "Object", type: "object", properties, required } : { [Kind]: "Object", type: "object", properties };
  return CreateType(schematic, options);
}
var Object2 = _Object;

// node_modules/@sinclair/typebox/build/esm/type/promise/promise.mjs
function Promise2(item, options) {
  return CreateType({ [Kind]: "Promise", type: "Promise", item }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/readonly/readonly.mjs
function RemoveReadonly(schema) {
  return CreateType(Discard(schema, [ReadonlyKind]));
}
function AddReadonly(schema) {
  return CreateType({ ...schema, [ReadonlyKind]: "Readonly" });
}
function ReadonlyWithFlag(schema, F) {
  return F === false ? RemoveReadonly(schema) : AddReadonly(schema);
}
function Readonly(schema, enable) {
  const F = enable ?? true;
  return IsMappedResult(schema) ? ReadonlyFromMappedResult(schema, F) : ReadonlyWithFlag(schema, F);
}

// node_modules/@sinclair/typebox/build/esm/type/readonly/readonly-from-mapped-result.mjs
function FromProperties2(K, F) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(K))
    Acc[K2] = Readonly(K[K2], F);
  return Acc;
}
function FromMappedResult2(R, F) {
  return FromProperties2(R.properties, F);
}
function ReadonlyFromMappedResult(R, F) {
  const P = FromMappedResult2(R, F);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/tuple/tuple.mjs
function Tuple(items, options) {
  return CreateType(items.length > 0 ? { [Kind]: "Tuple", type: "array", items, additionalItems: false, minItems: items.length, maxItems: items.length } : { [Kind]: "Tuple", type: "array", minItems: items.length, maxItems: items.length }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/mapped/mapped.mjs
function FromMappedResult3(K, P) {
  return K in P ? FromSchemaType(K, P[K]) : MappedResult(P);
}
function MappedKeyToKnownMappedResultProperties(K) {
  return { [K]: Literal(K) };
}
function MappedKeyToUnknownMappedResultProperties(P) {
  const Acc = {};
  for (const L of P)
    Acc[L] = Literal(L);
  return Acc;
}
function MappedKeyToMappedResultProperties(K, P) {
  return SetIncludes(P, K) ? MappedKeyToKnownMappedResultProperties(K) : MappedKeyToUnknownMappedResultProperties(P);
}
function FromMappedKey(K, P) {
  const R = MappedKeyToMappedResultProperties(K, P);
  return FromMappedResult3(K, R);
}
function FromRest2(K, T) {
  return T.map((L) => FromSchemaType(K, L));
}
function FromProperties3(K, T) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(T))
    Acc[K2] = FromSchemaType(K, T[K2]);
  return Acc;
}
function FromSchemaType(K, T) {
  const options = { ...T };
  return (
    // unevaluated modifier types
    IsOptional(T) ? Optional(FromSchemaType(K, Discard(T, [OptionalKind]))) : IsReadonly(T) ? Readonly(FromSchemaType(K, Discard(T, [ReadonlyKind]))) : (
      // unevaluated mapped types
      IsMappedResult(T) ? FromMappedResult3(K, T.properties) : IsMappedKey(T) ? FromMappedKey(K, T.keys) : (
        // unevaluated types
        IsConstructor(T) ? Constructor(FromRest2(K, T.parameters), FromSchemaType(K, T.returns), options) : IsFunction2(T) ? Function(FromRest2(K, T.parameters), FromSchemaType(K, T.returns), options) : IsAsyncIterator2(T) ? AsyncIterator(FromSchemaType(K, T.items), options) : IsIterator2(T) ? Iterator(FromSchemaType(K, T.items), options) : IsIntersect(T) ? Intersect(FromRest2(K, T.allOf), options) : IsUnion(T) ? Union(FromRest2(K, T.anyOf), options) : IsTuple(T) ? Tuple(FromRest2(K, T.items ?? []), options) : IsObject3(T) ? Object2(FromProperties3(K, T.properties), options) : IsArray3(T) ? Array2(FromSchemaType(K, T.items), options) : IsPromise(T) ? Promise2(FromSchemaType(K, T.item), options) : T
      )
    )
  );
}
function MappedFunctionReturnType(K, T) {
  const Acc = {};
  for (const L of K)
    Acc[L] = FromSchemaType(L, T);
  return Acc;
}
function Mapped(key, map, options) {
  const K = IsSchema(key) ? IndexPropertyKeys(key) : key;
  const RT = map({ [Kind]: "MappedKey", keys: K });
  const R = MappedFunctionReturnType(K, RT);
  return Object2(R, options);
}

// node_modules/@sinclair/typebox/build/esm/type/optional/optional.mjs
function RemoveOptional(schema) {
  return CreateType(Discard(schema, [OptionalKind]));
}
function AddOptional(schema) {
  return CreateType({ ...schema, [OptionalKind]: "Optional" });
}
function OptionalWithFlag(schema, F) {
  return F === false ? RemoveOptional(schema) : AddOptional(schema);
}
function Optional(schema, enable) {
  const F = enable ?? true;
  return IsMappedResult(schema) ? OptionalFromMappedResult(schema, F) : OptionalWithFlag(schema, F);
}

// node_modules/@sinclair/typebox/build/esm/type/optional/optional-from-mapped-result.mjs
function FromProperties4(P, F) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Optional(P[K2], F);
  return Acc;
}
function FromMappedResult4(R, F) {
  return FromProperties4(R.properties, F);
}
function OptionalFromMappedResult(R, F) {
  const P = FromMappedResult4(R, F);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/intersect/intersect-create.mjs
function IntersectCreate(T, options = {}) {
  const allObjects = T.every((schema) => IsObject3(schema));
  const clonedUnevaluatedProperties = IsSchema(options.unevaluatedProperties) ? { unevaluatedProperties: options.unevaluatedProperties } : {};
  return CreateType(options.unevaluatedProperties === false || IsSchema(options.unevaluatedProperties) || allObjects ? { ...clonedUnevaluatedProperties, [Kind]: "Intersect", type: "object", allOf: T } : { ...clonedUnevaluatedProperties, [Kind]: "Intersect", allOf: T }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/intersect/intersect-evaluated.mjs
function IsIntersectOptional(T) {
  return T.every((L) => IsOptional(L));
}
function RemoveOptionalFromType2(T) {
  return Discard(T, [OptionalKind]);
}
function RemoveOptionalFromRest2(T) {
  return T.map((L) => IsOptional(L) ? RemoveOptionalFromType2(L) : L);
}
function ResolveIntersect(T, options) {
  return IsIntersectOptional(T) ? Optional(IntersectCreate(RemoveOptionalFromRest2(T), options)) : IntersectCreate(RemoveOptionalFromRest2(T), options);
}
function IntersectEvaluated(T, options = {}) {
  if (T.length === 0)
    return Never(options);
  if (T.length === 1)
    return CreateType(T[0], options);
  if (T.some((schema) => IsTransform(schema)))
    throw new Error("Cannot intersect transform types");
  return ResolveIntersect(T, options);
}

// node_modules/@sinclair/typebox/build/esm/type/intersect/intersect.mjs
function Intersect(T, options) {
  if (T.length === 0)
    return Never(options);
  if (T.length === 1)
    return CreateType(T[0], options);
  if (T.some((schema) => IsTransform(schema)))
    throw new Error("Cannot intersect transform types");
  return IntersectCreate(T, options);
}

// node_modules/@sinclair/typebox/build/esm/type/awaited/awaited.mjs
function FromRest3(T) {
  return T.map((L) => AwaitedResolve(L));
}
function FromIntersect2(T) {
  return Intersect(FromRest3(T));
}
function FromUnion4(T) {
  return Union(FromRest3(T));
}
function FromPromise(T) {
  return AwaitedResolve(T);
}
function AwaitedResolve(T) {
  return IsIntersect(T) ? FromIntersect2(T.allOf) : IsUnion(T) ? FromUnion4(T.anyOf) : IsPromise(T) ? FromPromise(T.item) : T;
}
function Awaited(T, options) {
  return CreateType(AwaitedResolve(T), options);
}

// node_modules/@sinclair/typebox/build/esm/type/keyof/keyof-property-keys.mjs
function FromRest4(T) {
  const Acc = [];
  for (const L of T)
    Acc.push(KeyOfPropertyKeys(L));
  return Acc;
}
function FromIntersect3(T) {
  const C = FromRest4(T);
  const R = SetUnionMany(C);
  return R;
}
function FromUnion5(T) {
  const C = FromRest4(T);
  const R = SetIntersectMany(C);
  return R;
}
function FromTuple2(T) {
  return T.map((_, I) => I.toString());
}
function FromArray2(_) {
  return ["[number]"];
}
function FromProperties5(T) {
  return globalThis.Object.getOwnPropertyNames(T);
}
function FromPatternProperties(patternProperties) {
  if (!includePatternProperties)
    return [];
  const patternPropertyKeys = globalThis.Object.getOwnPropertyNames(patternProperties);
  return patternPropertyKeys.map((key) => {
    return key[0] === "^" && key[key.length - 1] === "$" ? key.slice(1, key.length - 1) : key;
  });
}
function KeyOfPropertyKeys(T) {
  return IsIntersect(T) ? FromIntersect3(T.allOf) : IsUnion(T) ? FromUnion5(T.anyOf) : IsTuple(T) ? FromTuple2(T.items ?? []) : IsArray3(T) ? FromArray2(T.items) : IsObject3(T) ? FromProperties5(T.properties) : IsRecord(T) ? FromPatternProperties(T.patternProperties) : [];
}
var includePatternProperties = false;

// node_modules/@sinclair/typebox/build/esm/type/keyof/keyof.mjs
function KeyOfPropertyKeysToRest(T) {
  return T.map((L) => L === "[number]" ? Number2() : Literal(L));
}
function KeyOf(T, options) {
  if (IsMappedResult(T)) {
    return KeyOfFromMappedResult(T, options);
  } else {
    const K = KeyOfPropertyKeys(T);
    const S = KeyOfPropertyKeysToRest(K);
    const U = UnionEvaluated(S);
    return CreateType(U, options);
  }
}

// node_modules/@sinclair/typebox/build/esm/type/keyof/keyof-from-mapped-result.mjs
function FromProperties6(K, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(K))
    Acc[K2] = KeyOf(K[K2], Clone(options));
  return Acc;
}
function FromMappedResult5(R, options) {
  return FromProperties6(R.properties, options);
}
function KeyOfFromMappedResult(R, options) {
  const P = FromMappedResult5(R, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/composite/composite.mjs
function CompositeKeys(T) {
  const Acc = [];
  for (const L of T)
    Acc.push(...KeyOfPropertyKeys(L));
  return SetDistinct(Acc);
}
function FilterNever(T) {
  return T.filter((L) => !IsNever(L));
}
function CompositeProperty(T, K) {
  const Acc = [];
  for (const L of T)
    Acc.push(...IndexFromPropertyKeys(L, [K]));
  return FilterNever(Acc);
}
function CompositeProperties(T, K) {
  const Acc = {};
  for (const L of K) {
    Acc[L] = IntersectEvaluated(CompositeProperty(T, L));
  }
  return Acc;
}
function Composite(T, options) {
  const K = CompositeKeys(T);
  const P = CompositeProperties(T, K);
  const R = Object2(P, options);
  return R;
}

// node_modules/@sinclair/typebox/build/esm/type/date/date.mjs
function Date2(options) {
  return CreateType({ [Kind]: "Date", type: "Date" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/null/null.mjs
function Null(options) {
  return CreateType({ [Kind]: "Null", type: "null" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/symbol/symbol.mjs
function Symbol2(options) {
  return CreateType({ [Kind]: "Symbol", type: "symbol" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/undefined/undefined.mjs
function Undefined(options) {
  return CreateType({ [Kind]: "Undefined", type: "undefined" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/uint8array/uint8array.mjs
function Uint8Array2(options) {
  return CreateType({ [Kind]: "Uint8Array", type: "Uint8Array" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/unknown/unknown.mjs
function Unknown(options) {
  return CreateType({ [Kind]: "Unknown" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/const/const.mjs
function FromArray3(T) {
  return T.map((L) => FromValue(L, false));
}
function FromProperties7(value) {
  const Acc = {};
  for (const K of globalThis.Object.getOwnPropertyNames(value))
    Acc[K] = Readonly(FromValue(value[K], false));
  return Acc;
}
function ConditionalReadonly(T, root) {
  return root === true ? T : Readonly(T);
}
function FromValue(value, root) {
  return IsAsyncIterator(value) ? ConditionalReadonly(Any(), root) : IsIterator(value) ? ConditionalReadonly(Any(), root) : IsArray(value) ? Readonly(Tuple(FromArray3(value))) : IsUint8Array(value) ? Uint8Array2() : IsDate(value) ? Date2() : IsObject(value) ? ConditionalReadonly(Object2(FromProperties7(value)), root) : IsFunction(value) ? ConditionalReadonly(Function([], Unknown()), root) : IsUndefined(value) ? Undefined() : IsNull(value) ? Null() : IsSymbol(value) ? Symbol2() : IsBigInt(value) ? BigInt() : IsNumber(value) ? Literal(value) : IsBoolean(value) ? Literal(value) : IsString(value) ? Literal(value) : Object2({});
}
function Const(T, options) {
  return CreateType(FromValue(T, true), options);
}

// node_modules/@sinclair/typebox/build/esm/type/constructor-parameters/constructor-parameters.mjs
function ConstructorParameters(schema, options) {
  return Tuple(schema.parameters, options);
}

// node_modules/@sinclair/typebox/build/esm/type/deref/deref.mjs
function FromRest5(schema, references) {
  return schema.map((schema2) => Deref(schema2, references));
}
function FromProperties8(properties, references) {
  const Acc = {};
  for (const K of globalThis.Object.getOwnPropertyNames(properties)) {
    Acc[K] = Deref(properties[K], references);
  }
  return Acc;
}
function FromConstructor(schema, references) {
  schema.parameters = FromRest5(schema.parameters, references);
  schema.returns = Deref(schema.returns, references);
  return schema;
}
function FromFunction(schema, references) {
  schema.parameters = FromRest5(schema.parameters, references);
  schema.returns = Deref(schema.returns, references);
  return schema;
}
function FromIntersect4(schema, references) {
  schema.allOf = FromRest5(schema.allOf, references);
  return schema;
}
function FromUnion6(schema, references) {
  schema.anyOf = FromRest5(schema.anyOf, references);
  return schema;
}
function FromTuple3(schema, references) {
  if (IsUndefined(schema.items))
    return schema;
  schema.items = FromRest5(schema.items, references);
  return schema;
}
function FromArray4(schema, references) {
  schema.items = Deref(schema.items, references);
  return schema;
}
function FromObject(schema, references) {
  schema.properties = FromProperties8(schema.properties, references);
  return schema;
}
function FromPromise2(schema, references) {
  schema.item = Deref(schema.item, references);
  return schema;
}
function FromAsyncIterator(schema, references) {
  schema.items = Deref(schema.items, references);
  return schema;
}
function FromIterator(schema, references) {
  schema.items = Deref(schema.items, references);
  return schema;
}
function FromRef(schema, references) {
  const target = references.find((remote) => remote.$id === schema.$ref);
  if (target === void 0)
    throw Error(`Unable to dereference schema with $id ${schema.$ref}`);
  const discard = Discard(target, ["$id"]);
  return Deref(discard, references);
}
function DerefResolve(schema, references) {
  return IsConstructor(schema) ? FromConstructor(schema, references) : IsFunction2(schema) ? FromFunction(schema, references) : IsIntersect(schema) ? FromIntersect4(schema, references) : IsUnion(schema) ? FromUnion6(schema, references) : IsTuple(schema) ? FromTuple3(schema, references) : IsArray3(schema) ? FromArray4(schema, references) : IsObject3(schema) ? FromObject(schema, references) : IsPromise(schema) ? FromPromise2(schema, references) : IsAsyncIterator2(schema) ? FromAsyncIterator(schema, references) : IsIterator2(schema) ? FromIterator(schema, references) : IsRef(schema) ? FromRef(schema, references) : schema;
}
function Deref(schema, references) {
  return DerefResolve(CloneType(schema), CloneRest(references));
}

// node_modules/@sinclair/typebox/build/esm/type/enum/enum.mjs
function Enum(item, options) {
  if (IsUndefined(item))
    throw new Error("Enum undefined or empty");
  const values1 = globalThis.Object.getOwnPropertyNames(item).filter((key) => isNaN(key)).map((key) => item[key]);
  const values2 = [...new Set(values1)];
  const anyOf = values2.map((value) => Literal(value));
  return Union(anyOf, { ...options, [Hint]: "Enum" });
}

// node_modules/@sinclair/typebox/build/esm/type/extends/extends-check.mjs
var ExtendsResolverError = class extends TypeBoxError {
};
var ExtendsResult;
(function(ExtendsResult2) {
  ExtendsResult2[ExtendsResult2["Union"] = 0] = "Union";
  ExtendsResult2[ExtendsResult2["True"] = 1] = "True";
  ExtendsResult2[ExtendsResult2["False"] = 2] = "False";
})(ExtendsResult || (ExtendsResult = {}));
function IntoBooleanResult(result) {
  return result === ExtendsResult.False ? result : ExtendsResult.True;
}
function Throw(message) {
  throw new ExtendsResolverError(message);
}
function IsStructuralRight(right) {
  return type_exports.IsNever(right) || type_exports.IsIntersect(right) || type_exports.IsUnion(right) || type_exports.IsUnknown(right) || type_exports.IsAny(right);
}
function StructuralRight(left, right) {
  return type_exports.IsNever(right) ? FromNeverRight(left, right) : type_exports.IsIntersect(right) ? FromIntersectRight(left, right) : type_exports.IsUnion(right) ? FromUnionRight(left, right) : type_exports.IsUnknown(right) ? FromUnknownRight(left, right) : type_exports.IsAny(right) ? FromAnyRight(left, right) : Throw("StructuralRight");
}
function FromAnyRight(left, right) {
  return ExtendsResult.True;
}
function FromAny(left, right) {
  return type_exports.IsIntersect(right) ? FromIntersectRight(left, right) : type_exports.IsUnion(right) && right.anyOf.some((schema) => type_exports.IsAny(schema) || type_exports.IsUnknown(schema)) ? ExtendsResult.True : type_exports.IsUnion(right) ? ExtendsResult.Union : type_exports.IsUnknown(right) ? ExtendsResult.True : type_exports.IsAny(right) ? ExtendsResult.True : ExtendsResult.Union;
}
function FromArrayRight(left, right) {
  return type_exports.IsUnknown(left) ? ExtendsResult.False : type_exports.IsAny(left) ? ExtendsResult.Union : type_exports.IsNever(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromArray5(left, right) {
  return type_exports.IsObject(right) && IsObjectArrayLike(right) ? ExtendsResult.True : IsStructuralRight(right) ? StructuralRight(left, right) : !type_exports.IsArray(right) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.items, right.items));
}
function FromAsyncIterator2(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : !type_exports.IsAsyncIterator(right) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.items, right.items));
}
function FromBigInt(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsBigInt(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromBooleanRight(left, right) {
  return type_exports.IsLiteralBoolean(left) ? ExtendsResult.True : type_exports.IsBoolean(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromBoolean(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsBoolean(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromConstructor2(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : !type_exports.IsConstructor(right) ? ExtendsResult.False : left.parameters.length > right.parameters.length ? ExtendsResult.False : !left.parameters.every((schema, index) => IntoBooleanResult(Visit3(right.parameters[index], schema)) === ExtendsResult.True) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.returns, right.returns));
}
function FromDate(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsDate(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromFunction2(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : !type_exports.IsFunction(right) ? ExtendsResult.False : left.parameters.length > right.parameters.length ? ExtendsResult.False : !left.parameters.every((schema, index) => IntoBooleanResult(Visit3(right.parameters[index], schema)) === ExtendsResult.True) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.returns, right.returns));
}
function FromIntegerRight(left, right) {
  return type_exports.IsLiteral(left) && value_exports.IsNumber(left.const) ? ExtendsResult.True : type_exports.IsNumber(left) || type_exports.IsInteger(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromInteger(left, right) {
  return type_exports.IsInteger(right) || type_exports.IsNumber(right) ? ExtendsResult.True : IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : ExtendsResult.False;
}
function FromIntersectRight(left, right) {
  return right.allOf.every((schema) => Visit3(left, schema) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromIntersect5(left, right) {
  return left.allOf.some((schema) => Visit3(schema, right) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromIterator2(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : !type_exports.IsIterator(right) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.items, right.items));
}
function FromLiteral2(left, right) {
  return type_exports.IsLiteral(right) && right.const === left.const ? ExtendsResult.True : IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsString(right) ? FromStringRight(left, right) : type_exports.IsNumber(right) ? FromNumberRight(left, right) : type_exports.IsInteger(right) ? FromIntegerRight(left, right) : type_exports.IsBoolean(right) ? FromBooleanRight(left, right) : ExtendsResult.False;
}
function FromNeverRight(left, right) {
  return ExtendsResult.False;
}
function FromNever(left, right) {
  return ExtendsResult.True;
}
function UnwrapTNot(schema) {
  let [current, depth] = [schema, 0];
  while (true) {
    if (!type_exports.IsNot(current))
      break;
    current = current.not;
    depth += 1;
  }
  return depth % 2 === 0 ? current : Unknown();
}
function FromNot(left, right) {
  return type_exports.IsNot(left) ? Visit3(UnwrapTNot(left), right) : type_exports.IsNot(right) ? Visit3(left, UnwrapTNot(right)) : Throw("Invalid fallthrough for Not");
}
function FromNull(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsNull(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromNumberRight(left, right) {
  return type_exports.IsLiteralNumber(left) ? ExtendsResult.True : type_exports.IsNumber(left) || type_exports.IsInteger(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromNumber(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsInteger(right) || type_exports.IsNumber(right) ? ExtendsResult.True : ExtendsResult.False;
}
function IsObjectPropertyCount(schema, count) {
  return Object.getOwnPropertyNames(schema.properties).length === count;
}
function IsObjectStringLike(schema) {
  return IsObjectArrayLike(schema);
}
function IsObjectSymbolLike(schema) {
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "description" in schema.properties && type_exports.IsUnion(schema.properties.description) && schema.properties.description.anyOf.length === 2 && (type_exports.IsString(schema.properties.description.anyOf[0]) && type_exports.IsUndefined(schema.properties.description.anyOf[1]) || type_exports.IsString(schema.properties.description.anyOf[1]) && type_exports.IsUndefined(schema.properties.description.anyOf[0]));
}
function IsObjectNumberLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectBooleanLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectBigIntLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectDateLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectUint8ArrayLike(schema) {
  return IsObjectArrayLike(schema);
}
function IsObjectFunctionLike(schema) {
  const length = Number2();
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "length" in schema.properties && IntoBooleanResult(Visit3(schema.properties["length"], length)) === ExtendsResult.True;
}
function IsObjectConstructorLike(schema) {
  return IsObjectPropertyCount(schema, 0);
}
function IsObjectArrayLike(schema) {
  const length = Number2();
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "length" in schema.properties && IntoBooleanResult(Visit3(schema.properties["length"], length)) === ExtendsResult.True;
}
function IsObjectPromiseLike(schema) {
  const then = Function([Any()], Any());
  return IsObjectPropertyCount(schema, 0) || IsObjectPropertyCount(schema, 1) && "then" in schema.properties && IntoBooleanResult(Visit3(schema.properties["then"], then)) === ExtendsResult.True;
}
function Property(left, right) {
  return Visit3(left, right) === ExtendsResult.False ? ExtendsResult.False : type_exports.IsOptional(left) && !type_exports.IsOptional(right) ? ExtendsResult.False : ExtendsResult.True;
}
function FromObjectRight(left, right) {
  return type_exports.IsUnknown(left) ? ExtendsResult.False : type_exports.IsAny(left) ? ExtendsResult.Union : type_exports.IsNever(left) || type_exports.IsLiteralString(left) && IsObjectStringLike(right) || type_exports.IsLiteralNumber(left) && IsObjectNumberLike(right) || type_exports.IsLiteralBoolean(left) && IsObjectBooleanLike(right) || type_exports.IsSymbol(left) && IsObjectSymbolLike(right) || type_exports.IsBigInt(left) && IsObjectBigIntLike(right) || type_exports.IsString(left) && IsObjectStringLike(right) || type_exports.IsSymbol(left) && IsObjectSymbolLike(right) || type_exports.IsNumber(left) && IsObjectNumberLike(right) || type_exports.IsInteger(left) && IsObjectNumberLike(right) || type_exports.IsBoolean(left) && IsObjectBooleanLike(right) || type_exports.IsUint8Array(left) && IsObjectUint8ArrayLike(right) || type_exports.IsDate(left) && IsObjectDateLike(right) || type_exports.IsConstructor(left) && IsObjectConstructorLike(right) || type_exports.IsFunction(left) && IsObjectFunctionLike(right) ? ExtendsResult.True : type_exports.IsRecord(left) && type_exports.IsString(RecordKey(left)) ? (() => {
    return right[Hint] === "Record" ? ExtendsResult.True : ExtendsResult.False;
  })() : type_exports.IsRecord(left) && type_exports.IsNumber(RecordKey(left)) ? (() => {
    return IsObjectPropertyCount(right, 0) ? ExtendsResult.True : ExtendsResult.False;
  })() : ExtendsResult.False;
}
function FromObject2(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : !type_exports.IsObject(right) ? ExtendsResult.False : (() => {
    for (const key of Object.getOwnPropertyNames(right.properties)) {
      if (!(key in left.properties) && !type_exports.IsOptional(right.properties[key])) {
        return ExtendsResult.False;
      }
      if (type_exports.IsOptional(right.properties[key])) {
        return ExtendsResult.True;
      }
      if (Property(left.properties[key], right.properties[key]) === ExtendsResult.False) {
        return ExtendsResult.False;
      }
    }
    return ExtendsResult.True;
  })();
}
function FromPromise3(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) && IsObjectPromiseLike(right) ? ExtendsResult.True : !type_exports.IsPromise(right) ? ExtendsResult.False : IntoBooleanResult(Visit3(left.item, right.item));
}
function RecordKey(schema) {
  return PatternNumberExact in schema.patternProperties ? Number2() : PatternStringExact in schema.patternProperties ? String2() : Throw("Unknown record key pattern");
}
function RecordValue(schema) {
  return PatternNumberExact in schema.patternProperties ? schema.patternProperties[PatternNumberExact] : PatternStringExact in schema.patternProperties ? schema.patternProperties[PatternStringExact] : Throw("Unable to get record value schema");
}
function FromRecordRight(left, right) {
  const [Key, Value] = [RecordKey(right), RecordValue(right)];
  return type_exports.IsLiteralString(left) && type_exports.IsNumber(Key) && IntoBooleanResult(Visit3(left, Value)) === ExtendsResult.True ? ExtendsResult.True : type_exports.IsUint8Array(left) && type_exports.IsNumber(Key) ? Visit3(left, Value) : type_exports.IsString(left) && type_exports.IsNumber(Key) ? Visit3(left, Value) : type_exports.IsArray(left) && type_exports.IsNumber(Key) ? Visit3(left, Value) : type_exports.IsObject(left) ? (() => {
    for (const key of Object.getOwnPropertyNames(left.properties)) {
      if (Property(Value, left.properties[key]) === ExtendsResult.False) {
        return ExtendsResult.False;
      }
    }
    return ExtendsResult.True;
  })() : ExtendsResult.False;
}
function FromRecord(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : !type_exports.IsRecord(right) ? ExtendsResult.False : Visit3(RecordValue(left), RecordValue(right));
}
function FromRegExp(left, right) {
  const L = type_exports.IsRegExp(left) ? String2() : left;
  const R = type_exports.IsRegExp(right) ? String2() : right;
  return Visit3(L, R);
}
function FromStringRight(left, right) {
  return type_exports.IsLiteral(left) && value_exports.IsString(left.const) ? ExtendsResult.True : type_exports.IsString(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromString(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsString(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromSymbol(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsSymbol(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromTemplateLiteral2(left, right) {
  return type_exports.IsTemplateLiteral(left) ? Visit3(TemplateLiteralToUnion(left), right) : type_exports.IsTemplateLiteral(right) ? Visit3(left, TemplateLiteralToUnion(right)) : Throw("Invalid fallthrough for TemplateLiteral");
}
function IsArrayOfTuple(left, right) {
  return type_exports.IsArray(right) && left.items !== void 0 && left.items.every((schema) => Visit3(schema, right.items) === ExtendsResult.True);
}
function FromTupleRight(left, right) {
  return type_exports.IsNever(left) ? ExtendsResult.True : type_exports.IsUnknown(left) ? ExtendsResult.False : type_exports.IsAny(left) ? ExtendsResult.Union : ExtendsResult.False;
}
function FromTuple4(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) && IsObjectArrayLike(right) ? ExtendsResult.True : type_exports.IsArray(right) && IsArrayOfTuple(left, right) ? ExtendsResult.True : !type_exports.IsTuple(right) ? ExtendsResult.False : value_exports.IsUndefined(left.items) && !value_exports.IsUndefined(right.items) || !value_exports.IsUndefined(left.items) && value_exports.IsUndefined(right.items) ? ExtendsResult.False : value_exports.IsUndefined(left.items) && !value_exports.IsUndefined(right.items) ? ExtendsResult.True : left.items.every((schema, index) => Visit3(schema, right.items[index]) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUint8Array(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsUint8Array(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUndefined(left, right) {
  return IsStructuralRight(right) ? StructuralRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsRecord(right) ? FromRecordRight(left, right) : type_exports.IsVoid(right) ? FromVoidRight(left, right) : type_exports.IsUndefined(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUnionRight(left, right) {
  return right.anyOf.some((schema) => Visit3(left, schema) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUnion7(left, right) {
  return left.anyOf.every((schema) => Visit3(schema, right) === ExtendsResult.True) ? ExtendsResult.True : ExtendsResult.False;
}
function FromUnknownRight(left, right) {
  return ExtendsResult.True;
}
function FromUnknown(left, right) {
  return type_exports.IsNever(right) ? FromNeverRight(left, right) : type_exports.IsIntersect(right) ? FromIntersectRight(left, right) : type_exports.IsUnion(right) ? FromUnionRight(left, right) : type_exports.IsAny(right) ? FromAnyRight(left, right) : type_exports.IsString(right) ? FromStringRight(left, right) : type_exports.IsNumber(right) ? FromNumberRight(left, right) : type_exports.IsInteger(right) ? FromIntegerRight(left, right) : type_exports.IsBoolean(right) ? FromBooleanRight(left, right) : type_exports.IsArray(right) ? FromArrayRight(left, right) : type_exports.IsTuple(right) ? FromTupleRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsUnknown(right) ? ExtendsResult.True : ExtendsResult.False;
}
function FromVoidRight(left, right) {
  return type_exports.IsUndefined(left) ? ExtendsResult.True : type_exports.IsUndefined(left) ? ExtendsResult.True : ExtendsResult.False;
}
function FromVoid(left, right) {
  return type_exports.IsIntersect(right) ? FromIntersectRight(left, right) : type_exports.IsUnion(right) ? FromUnionRight(left, right) : type_exports.IsUnknown(right) ? FromUnknownRight(left, right) : type_exports.IsAny(right) ? FromAnyRight(left, right) : type_exports.IsObject(right) ? FromObjectRight(left, right) : type_exports.IsVoid(right) ? ExtendsResult.True : ExtendsResult.False;
}
function Visit3(left, right) {
  return (
    // resolvable
    type_exports.IsTemplateLiteral(left) || type_exports.IsTemplateLiteral(right) ? FromTemplateLiteral2(left, right) : type_exports.IsRegExp(left) || type_exports.IsRegExp(right) ? FromRegExp(left, right) : type_exports.IsNot(left) || type_exports.IsNot(right) ? FromNot(left, right) : (
      // standard
      type_exports.IsAny(left) ? FromAny(left, right) : type_exports.IsArray(left) ? FromArray5(left, right) : type_exports.IsBigInt(left) ? FromBigInt(left, right) : type_exports.IsBoolean(left) ? FromBoolean(left, right) : type_exports.IsAsyncIterator(left) ? FromAsyncIterator2(left, right) : type_exports.IsConstructor(left) ? FromConstructor2(left, right) : type_exports.IsDate(left) ? FromDate(left, right) : type_exports.IsFunction(left) ? FromFunction2(left, right) : type_exports.IsInteger(left) ? FromInteger(left, right) : type_exports.IsIntersect(left) ? FromIntersect5(left, right) : type_exports.IsIterator(left) ? FromIterator2(left, right) : type_exports.IsLiteral(left) ? FromLiteral2(left, right) : type_exports.IsNever(left) ? FromNever(left, right) : type_exports.IsNull(left) ? FromNull(left, right) : type_exports.IsNumber(left) ? FromNumber(left, right) : type_exports.IsObject(left) ? FromObject2(left, right) : type_exports.IsRecord(left) ? FromRecord(left, right) : type_exports.IsString(left) ? FromString(left, right) : type_exports.IsSymbol(left) ? FromSymbol(left, right) : type_exports.IsTuple(left) ? FromTuple4(left, right) : type_exports.IsPromise(left) ? FromPromise3(left, right) : type_exports.IsUint8Array(left) ? FromUint8Array(left, right) : type_exports.IsUndefined(left) ? FromUndefined(left, right) : type_exports.IsUnion(left) ? FromUnion7(left, right) : type_exports.IsUnknown(left) ? FromUnknown(left, right) : type_exports.IsVoid(left) ? FromVoid(left, right) : Throw(`Unknown left type operand '${left[Kind]}'`)
    )
  );
}
function ExtendsCheck(left, right) {
  return Visit3(left, right);
}

// node_modules/@sinclair/typebox/build/esm/type/extends/extends-from-mapped-result.mjs
function FromProperties9(P, Right, True, False, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Extends(P[K2], Right, True, False, Clone(options));
  return Acc;
}
function FromMappedResult6(Left, Right, True, False, options) {
  return FromProperties9(Left.properties, Right, True, False, options);
}
function ExtendsFromMappedResult(Left, Right, True, False, options) {
  const P = FromMappedResult6(Left, Right, True, False, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/extends/extends.mjs
function ExtendsResolve(left, right, trueType, falseType) {
  const R = ExtendsCheck(left, right);
  return R === ExtendsResult.Union ? Union([trueType, falseType]) : R === ExtendsResult.True ? trueType : falseType;
}
function Extends(L, R, T, F, options) {
  return IsMappedResult(L) ? ExtendsFromMappedResult(L, R, T, F, options) : IsMappedKey(L) ? CreateType(ExtendsFromMappedKey(L, R, T, F, options)) : CreateType(ExtendsResolve(L, R, T, F), options);
}

// node_modules/@sinclair/typebox/build/esm/type/extends/extends-from-mapped-key.mjs
function FromPropertyKey(K, U, L, R, options) {
  return {
    [K]: Extends(Literal(K), U, L, R, Clone(options))
  };
}
function FromPropertyKeys(K, U, L, R, options) {
  return K.reduce((Acc, LK) => {
    return { ...Acc, ...FromPropertyKey(LK, U, L, R, options) };
  }, {});
}
function FromMappedKey2(K, U, L, R, options) {
  return FromPropertyKeys(K.keys, U, L, R, options);
}
function ExtendsFromMappedKey(T, U, L, R, options) {
  const P = FromMappedKey2(T, U, L, R, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/exclude/exclude-from-template-literal.mjs
function ExcludeFromTemplateLiteral(L, R) {
  return Exclude(TemplateLiteralToUnion(L), R);
}

// node_modules/@sinclair/typebox/build/esm/type/exclude/exclude.mjs
function ExcludeRest(L, R) {
  const excluded = L.filter((inner) => ExtendsCheck(inner, R) === ExtendsResult.False);
  return excluded.length === 1 ? excluded[0] : Union(excluded);
}
function Exclude(L, R, options = {}) {
  if (IsTemplateLiteral(L))
    return CreateType(ExcludeFromTemplateLiteral(L, R), options);
  if (IsMappedResult(L))
    return CreateType(ExcludeFromMappedResult(L, R), options);
  return CreateType(IsUnion(L) ? ExcludeRest(L.anyOf, R) : ExtendsCheck(L, R) !== ExtendsResult.False ? Never() : L, options);
}

// node_modules/@sinclair/typebox/build/esm/type/exclude/exclude-from-mapped-result.mjs
function FromProperties10(P, U) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Exclude(P[K2], U);
  return Acc;
}
function FromMappedResult7(R, T) {
  return FromProperties10(R.properties, T);
}
function ExcludeFromMappedResult(R, T) {
  const P = FromMappedResult7(R, T);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/extract/extract-from-template-literal.mjs
function ExtractFromTemplateLiteral(L, R) {
  return Extract(TemplateLiteralToUnion(L), R);
}

// node_modules/@sinclair/typebox/build/esm/type/extract/extract.mjs
function ExtractRest(L, R) {
  const extracted = L.filter((inner) => ExtendsCheck(inner, R) !== ExtendsResult.False);
  return extracted.length === 1 ? extracted[0] : Union(extracted);
}
function Extract(L, R, options) {
  if (IsTemplateLiteral(L))
    return CreateType(ExtractFromTemplateLiteral(L, R), options);
  if (IsMappedResult(L))
    return CreateType(ExtractFromMappedResult(L, R), options);
  return CreateType(IsUnion(L) ? ExtractRest(L.anyOf, R) : ExtendsCheck(L, R) !== ExtendsResult.False ? L : Never(), options);
}

// node_modules/@sinclair/typebox/build/esm/type/extract/extract-from-mapped-result.mjs
function FromProperties11(P, T) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Extract(P[K2], T);
  return Acc;
}
function FromMappedResult8(R, T) {
  return FromProperties11(R.properties, T);
}
function ExtractFromMappedResult(R, T) {
  const P = FromMappedResult8(R, T);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/instance-type/instance-type.mjs
function InstanceType(schema, options) {
  return CreateType(schema.returns, options);
}

// node_modules/@sinclair/typebox/build/esm/type/integer/integer.mjs
function Integer(options) {
  return CreateType({ [Kind]: "Integer", type: "integer" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/intrinsic-from-mapped-key.mjs
function MappedIntrinsicPropertyKey(K, M, options) {
  return {
    [K]: Intrinsic(Literal(K), M, Clone(options))
  };
}
function MappedIntrinsicPropertyKeys(K, M, options) {
  const result = K.reduce((Acc, L) => {
    return { ...Acc, ...MappedIntrinsicPropertyKey(L, M, options) };
  }, {});
  return result;
}
function MappedIntrinsicProperties(T, M, options) {
  return MappedIntrinsicPropertyKeys(T["keys"], M, options);
}
function IntrinsicFromMappedKey(T, M, options) {
  const P = MappedIntrinsicProperties(T, M, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/intrinsic.mjs
function ApplyUncapitalize(value) {
  const [first, rest] = [value.slice(0, 1), value.slice(1)];
  return [first.toLowerCase(), rest].join("");
}
function ApplyCapitalize(value) {
  const [first, rest] = [value.slice(0, 1), value.slice(1)];
  return [first.toUpperCase(), rest].join("");
}
function ApplyUppercase(value) {
  return value.toUpperCase();
}
function ApplyLowercase(value) {
  return value.toLowerCase();
}
function FromTemplateLiteral3(schema, mode, options) {
  const expression = TemplateLiteralParseExact(schema.pattern);
  const finite = IsTemplateLiteralExpressionFinite(expression);
  if (!finite)
    return { ...schema, pattern: FromLiteralValue(schema.pattern, mode) };
  const strings = [...TemplateLiteralExpressionGenerate(expression)];
  const literals = strings.map((value) => Literal(value));
  const mapped = FromRest6(literals, mode);
  const union = Union(mapped);
  return TemplateLiteral([union], options);
}
function FromLiteralValue(value, mode) {
  return typeof value === "string" ? mode === "Uncapitalize" ? ApplyUncapitalize(value) : mode === "Capitalize" ? ApplyCapitalize(value) : mode === "Uppercase" ? ApplyUppercase(value) : mode === "Lowercase" ? ApplyLowercase(value) : value : value.toString();
}
function FromRest6(T, M) {
  return T.map((L) => Intrinsic(L, M));
}
function Intrinsic(schema, mode, options = {}) {
  return (
    // Intrinsic-Mapped-Inference
    IsMappedKey(schema) ? IntrinsicFromMappedKey(schema, mode, options) : (
      // Standard-Inference
      IsTemplateLiteral(schema) ? FromTemplateLiteral3(schema, mode, options) : IsUnion(schema) ? Union(FromRest6(schema.anyOf, mode), options) : IsLiteral(schema) ? Literal(FromLiteralValue(schema.const, mode), options) : (
        // Default Type
        CreateType(schema, options)
      )
    )
  );
}

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/capitalize.mjs
function Capitalize(T, options = {}) {
  return Intrinsic(T, "Capitalize", options);
}

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/lowercase.mjs
function Lowercase(T, options = {}) {
  return Intrinsic(T, "Lowercase", options);
}

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/uncapitalize.mjs
function Uncapitalize(T, options = {}) {
  return Intrinsic(T, "Uncapitalize", options);
}

// node_modules/@sinclair/typebox/build/esm/type/intrinsic/uppercase.mjs
function Uppercase(T, options = {}) {
  return Intrinsic(T, "Uppercase", options);
}

// node_modules/@sinclair/typebox/build/esm/type/not/not.mjs
function Not(not, options) {
  return CreateType({ [Kind]: "Not", not }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/omit/omit-from-mapped-result.mjs
function FromProperties12(P, K, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Omit(P[K2], K, Clone(options));
  return Acc;
}
function FromMappedResult9(R, K, options) {
  return FromProperties12(R.properties, K, options);
}
function OmitFromMappedResult(R, K, options) {
  const P = FromMappedResult9(R, K, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/omit/omit.mjs
function FromIntersect6(T, K) {
  return T.map((T2) => OmitResolve(T2, K));
}
function FromUnion8(T, K) {
  return T.map((T2) => OmitResolve(T2, K));
}
function FromProperty2(T, K) {
  const { [K]: _, ...R } = T;
  return R;
}
function FromProperties13(T, K) {
  return K.reduce((T2, K2) => FromProperty2(T2, K2), T);
}
function FromObject3(T, K) {
  const options = Discard(T, [TransformKind, "$id", "required", "properties"]);
  const properties = FromProperties13(T["properties"], K);
  return Object2(properties, options);
}
function OmitResolve(T, K) {
  return IsIntersect(T) ? Intersect(FromIntersect6(T.allOf, K)) : IsUnion(T) ? Union(FromUnion8(T.anyOf, K)) : IsObject3(T) ? FromObject3(T, K) : Object2({});
}
function Omit(T, K, options) {
  if (IsMappedKey(K))
    return OmitFromMappedKey(T, K, options);
  if (IsMappedResult(T))
    return OmitFromMappedResult(T, K, options);
  const I = IsSchema(K) ? IndexPropertyKeys(K) : K;
  return CreateType({ ...OmitResolve(T, I), ...options });
}

// node_modules/@sinclair/typebox/build/esm/type/omit/omit-from-mapped-key.mjs
function FromPropertyKey2(T, K, options) {
  return {
    [K]: Omit(T, [K], Clone(options))
  };
}
function FromPropertyKeys2(T, K, options) {
  return K.reduce((Acc, LK) => {
    return { ...Acc, ...FromPropertyKey2(T, LK, options) };
  }, {});
}
function FromMappedKey3(T, K, options) {
  return FromPropertyKeys2(T, K.keys, options);
}
function OmitFromMappedKey(T, K, options) {
  const P = FromMappedKey3(T, K, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/parameters/parameters.mjs
function Parameters(schema, options) {
  return Tuple(schema.parameters, options);
}

// node_modules/@sinclair/typebox/build/esm/type/partial/partial.mjs
function FromRest7(T) {
  return T.map((L) => PartialResolve(L));
}
function FromProperties14(T) {
  const Acc = {};
  for (const K of globalThis.Object.getOwnPropertyNames(T))
    Acc[K] = Optional(T[K]);
  return Acc;
}
function FromObject4(T) {
  const options = Discard(T, [TransformKind, "$id", "required", "properties"]);
  const properties = FromProperties14(T["properties"]);
  return Object2(properties, options);
}
function PartialResolve(T) {
  return IsIntersect(T) ? Intersect(FromRest7(T.allOf)) : IsUnion(T) ? Union(FromRest7(T.anyOf)) : IsObject3(T) ? FromObject4(T) : Object2({});
}
function Partial(T, options) {
  if (IsMappedResult(T)) {
    return PartialFromMappedResult(T, options);
  } else {
    return CreateType({ ...PartialResolve(T), ...options });
  }
}

// node_modules/@sinclair/typebox/build/esm/type/partial/partial-from-mapped-result.mjs
function FromProperties15(K, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(K))
    Acc[K2] = Partial(K[K2], Clone(options));
  return Acc;
}
function FromMappedResult10(R, options) {
  return FromProperties15(R.properties, options);
}
function PartialFromMappedResult(R, options) {
  const P = FromMappedResult10(R, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/pick/pick-from-mapped-result.mjs
function FromProperties16(P, K, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Pick(P[K2], K, Clone(options));
  return Acc;
}
function FromMappedResult11(R, K, options) {
  return FromProperties16(R.properties, K, options);
}
function PickFromMappedResult(R, K, options) {
  const P = FromMappedResult11(R, K, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/pick/pick.mjs
function FromIntersect7(T, K) {
  return T.map((T2) => PickResolve(T2, K));
}
function FromUnion9(T, K) {
  return T.map((T2) => PickResolve(T2, K));
}
function FromProperties17(T, K) {
  const Acc = {};
  for (const K2 of K)
    if (K2 in T)
      Acc[K2] = T[K2];
  return Acc;
}
function FromObject5(T, K) {
  const options = Discard(T, [TransformKind, "$id", "required", "properties"]);
  const properties = FromProperties17(T["properties"], K);
  return Object2(properties, options);
}
function PickResolve(T, K) {
  return IsIntersect(T) ? Intersect(FromIntersect7(T.allOf, K)) : IsUnion(T) ? Union(FromUnion9(T.anyOf, K)) : IsObject3(T) ? FromObject5(T, K) : Object2({});
}
function Pick(T, K, options) {
  if (IsMappedKey(K))
    return PickFromMappedKey(T, K, options);
  if (IsMappedResult(T))
    return PickFromMappedResult(T, K, options);
  const I = IsSchema(K) ? IndexPropertyKeys(K) : K;
  return CreateType({ ...PickResolve(T, I), ...options });
}

// node_modules/@sinclair/typebox/build/esm/type/pick/pick-from-mapped-key.mjs
function FromPropertyKey3(T, K, options) {
  return {
    [K]: Pick(T, [K], Clone(options))
  };
}
function FromPropertyKeys3(T, K, options) {
  return K.reduce((Acc, LK) => {
    return { ...Acc, ...FromPropertyKey3(T, LK, options) };
  }, {});
}
function FromMappedKey4(T, K, options) {
  return FromPropertyKeys3(T, K.keys, options);
}
function PickFromMappedKey(T, K, options) {
  const P = FromMappedKey4(T, K, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/readonly-optional/readonly-optional.mjs
function ReadonlyOptional(schema) {
  return Readonly(Optional(schema));
}

// node_modules/@sinclair/typebox/build/esm/type/record/record.mjs
function RecordCreateFromPattern(pattern, T, options) {
  return CreateType({
    [Kind]: "Record",
    type: "object",
    patternProperties: { [pattern]: T }
  }, options);
}
function RecordCreateFromKeys(K, T, options) {
  const Acc = {};
  for (const K2 of K)
    Acc[K2] = T;
  return Object2(Acc, { ...options, [Hint]: "Record" });
}
function FromTemplateLiteralKey(K, T, options) {
  return IsTemplateLiteralFinite(K) ? RecordCreateFromKeys(IndexPropertyKeys(K), T, options) : RecordCreateFromPattern(K.pattern, T, options);
}
function FromUnionKey(K, T, options) {
  return RecordCreateFromKeys(IndexPropertyKeys(Union(K)), T, options);
}
function FromLiteralKey(K, T, options) {
  return RecordCreateFromKeys([K.toString()], T, options);
}
function FromRegExpKey(K, T, options) {
  return RecordCreateFromPattern(K.source, T, options);
}
function FromStringKey(K, T, options) {
  const pattern = IsUndefined(K.pattern) ? PatternStringExact : K.pattern;
  return RecordCreateFromPattern(pattern, T, options);
}
function FromAnyKey(K, T, options) {
  return RecordCreateFromPattern(PatternStringExact, T, options);
}
function FromNeverKey(K, T, options) {
  return RecordCreateFromPattern(PatternNeverExact, T, options);
}
function FromIntegerKey(_, T, options) {
  return RecordCreateFromPattern(PatternNumberExact, T, options);
}
function FromNumberKey(_, T, options) {
  return RecordCreateFromPattern(PatternNumberExact, T, options);
}
function Record(K, T, options = {}) {
  return IsUnion(K) ? FromUnionKey(K.anyOf, T, options) : IsTemplateLiteral(K) ? FromTemplateLiteralKey(K, T, options) : IsLiteral(K) ? FromLiteralKey(K.const, T, options) : IsInteger(K) ? FromIntegerKey(K, T, options) : IsNumber3(K) ? FromNumberKey(K, T, options) : IsRegExp2(K) ? FromRegExpKey(K, T, options) : IsString2(K) ? FromStringKey(K, T, options) : IsAny(K) ? FromAnyKey(K, T, options) : IsNever(K) ? FromNeverKey(K, T, options) : Never(options);
}

// node_modules/@sinclair/typebox/build/esm/type/recursive/recursive.mjs
var Ordinal = 0;
function Recursive(callback, options = {}) {
  if (IsUndefined(options.$id))
    options.$id = `T${Ordinal++}`;
  const thisType = CloneType(callback({ [Kind]: "This", $ref: `${options.$id}` }));
  thisType.$id = options.$id;
  return CreateType({ [Hint]: "Recursive", ...thisType }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/ref/ref.mjs
function Ref(unresolved, options) {
  if (IsString(unresolved))
    return CreateType({ [Kind]: "Ref", $ref: unresolved }, options);
  if (IsUndefined(unresolved.$id))
    throw new Error("Reference target type must specify an $id");
  return CreateType({ [Kind]: "Ref", $ref: unresolved.$id }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/regexp/regexp.mjs
function RegExp2(unresolved, options) {
  const expr = IsString(unresolved) ? new globalThis.RegExp(unresolved) : unresolved;
  return CreateType({ [Kind]: "RegExp", type: "RegExp", source: expr.source, flags: expr.flags }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/required/required.mjs
function FromRest8(T) {
  return T.map((L) => RequiredResolve(L));
}
function FromProperties18(T) {
  const Acc = {};
  for (const K of globalThis.Object.getOwnPropertyNames(T))
    Acc[K] = Discard(T[K], [OptionalKind]);
  return Acc;
}
function FromObject6(T) {
  const options = Discard(T, [TransformKind, "$id", "required", "properties"]);
  const properties = FromProperties18(T["properties"]);
  return Object2(properties, options);
}
function RequiredResolve(T) {
  return IsIntersect(T) ? Intersect(FromRest8(T.allOf)) : IsUnion(T) ? Union(FromRest8(T.anyOf)) : IsObject3(T) ? FromObject6(T) : Object2({});
}
function Required(T, options) {
  if (IsMappedResult(T)) {
    return RequiredFromMappedResult(T, options);
  } else {
    return CreateType({ ...RequiredResolve(T), ...options });
  }
}

// node_modules/@sinclair/typebox/build/esm/type/required/required-from-mapped-result.mjs
function FromProperties19(P, options) {
  const Acc = {};
  for (const K2 of globalThis.Object.getOwnPropertyNames(P))
    Acc[K2] = Required(P[K2], options);
  return Acc;
}
function FromMappedResult12(R, options) {
  return FromProperties19(R.properties, options);
}
function RequiredFromMappedResult(R, options) {
  const P = FromMappedResult12(R, options);
  return MappedResult(P);
}

// node_modules/@sinclair/typebox/build/esm/type/rest/rest.mjs
function RestResolve(T) {
  return IsIntersect(T) ? T.allOf : IsUnion(T) ? T.anyOf : IsTuple(T) ? T.items ?? [] : [];
}
function Rest(T) {
  return RestResolve(T);
}

// node_modules/@sinclair/typebox/build/esm/type/return-type/return-type.mjs
function ReturnType(schema, options) {
  return CreateType(schema.returns, options);
}

// node_modules/@sinclair/typebox/build/esm/type/strict/strict.mjs
function Strict(schema) {
  return JSON.parse(JSON.stringify(schema));
}

// node_modules/@sinclair/typebox/build/esm/type/transform/transform.mjs
var TransformDecodeBuilder = class {
  constructor(schema) {
    this.schema = schema;
  }
  Decode(decode) {
    return new TransformEncodeBuilder(this.schema, decode);
  }
};
var TransformEncodeBuilder = class {
  constructor(schema, decode) {
    this.schema = schema;
    this.decode = decode;
  }
  EncodeTransform(encode, schema) {
    const Encode = (value) => schema[TransformKind].Encode(encode(value));
    const Decode = (value) => this.decode(schema[TransformKind].Decode(value));
    const Codec = { Encode, Decode };
    return { ...schema, [TransformKind]: Codec };
  }
  EncodeSchema(encode, schema) {
    const Codec = { Decode: this.decode, Encode: encode };
    return { ...schema, [TransformKind]: Codec };
  }
  Encode(encode) {
    return IsTransform(this.schema) ? this.EncodeTransform(encode, this.schema) : this.EncodeSchema(encode, this.schema);
  }
};
function Transform(schema) {
  return new TransformDecodeBuilder(schema);
}

// node_modules/@sinclair/typebox/build/esm/type/unsafe/unsafe.mjs
function Unsafe(options = {}) {
  return CreateType({ [Kind]: options[Kind] ?? "Unsafe" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/void/void.mjs
function Void(options) {
  return CreateType({ [Kind]: "Void", type: "void" }, options);
}

// node_modules/@sinclair/typebox/build/esm/type/type/type.mjs
var type_exports2 = {};
__export(type_exports2, {
  Any: () => Any,
  Array: () => Array2,
  AsyncIterator: () => AsyncIterator,
  Awaited: () => Awaited,
  BigInt: () => BigInt,
  Boolean: () => Boolean,
  Capitalize: () => Capitalize,
  Composite: () => Composite,
  Const: () => Const,
  Constructor: () => Constructor,
  ConstructorParameters: () => ConstructorParameters,
  Date: () => Date2,
  Deref: () => Deref,
  Enum: () => Enum,
  Exclude: () => Exclude,
  Extends: () => Extends,
  Extract: () => Extract,
  Function: () => Function,
  Index: () => Index,
  InstanceType: () => InstanceType,
  Integer: () => Integer,
  Intersect: () => Intersect,
  Iterator: () => Iterator,
  KeyOf: () => KeyOf,
  Literal: () => Literal,
  Lowercase: () => Lowercase,
  Mapped: () => Mapped,
  Never: () => Never,
  Not: () => Not,
  Null: () => Null,
  Number: () => Number2,
  Object: () => Object2,
  Omit: () => Omit,
  Optional: () => Optional,
  Parameters: () => Parameters,
  Partial: () => Partial,
  Pick: () => Pick,
  Promise: () => Promise2,
  Readonly: () => Readonly,
  ReadonlyOptional: () => ReadonlyOptional,
  Record: () => Record,
  Recursive: () => Recursive,
  Ref: () => Ref,
  RegExp: () => RegExp2,
  Required: () => Required,
  Rest: () => Rest,
  ReturnType: () => ReturnType,
  Strict: () => Strict,
  String: () => String2,
  Symbol: () => Symbol2,
  TemplateLiteral: () => TemplateLiteral,
  Transform: () => Transform,
  Tuple: () => Tuple,
  Uint8Array: () => Uint8Array2,
  Uncapitalize: () => Uncapitalize,
  Undefined: () => Undefined,
  Union: () => Union,
  Unknown: () => Unknown,
  Unsafe: () => Unsafe,
  Uppercase: () => Uppercase,
  Void: () => Void
});

// node_modules/@sinclair/typebox/build/esm/type/type/index.mjs
var Type = type_exports2;

// src/client.ts
function shortId() {
  const buf = new Uint8Array(4);
  crypto.getRandomValues(buf);
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function movaRequest(config, method, path, body) {
  const url = `${config.baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    ...body !== void 0 ? { body: JSON.stringify(body) } : {}
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`MOVA API error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}
var movaPost = (c, path, body) => movaRequest(c, "POST", path, body);
var movaGet = (c, path) => movaRequest(c, "GET", path);
var movaPut = (c, path, body) => movaRequest(c, "PUT", path, body);
var movaDelete = (c, path) => movaRequest(c, "DELETE", path);
async function movaRunSteps(cfg, contractId) {
  let analysis = null;
  for (const stepId of ["analyze", "verify", "decide"]) {
    const result = await movaPost(cfg, `/api/v1/contracts/${contractId}/step`, {
      envelope: {
        kind: "env.step.execute_v0",
        envelope_id: `env-${shortId()}`,
        contract_id: contractId,
        actor: { actor_type: "system", actor_id: "mova_runtime" },
        payload: { step_id: stepId }
      }
    });
    if (!result.ok) return result;
    if (stepId === "analyze") {
      try {
        const output = await movaGet(cfg, `/api/v1/contracts/${contractId}/steps/analyze/output`);
        if (output.ok !== false) analysis = output;
      } catch {
      }
    }
    if (result.status === "waiting_human") {
      const dpResp = await movaGet(cfg, `/api/v1/contracts/${contractId}/decision`);
      const dp = dpResp.decision_point ?? {};
      return {
        ok: true,
        status: "waiting_human",
        contract_id: contractId,
        question: dp.question ?? "Select action:",
        options: dp.options ?? [],
        recommended: dp.recommended_option_id ?? null,
        ...analysis ? { analysis } : {}
      };
    }
  }
  const audit = await movaGet(cfg, `/api/v1/contracts/${contractId}/audit`);
  return {
    ok: true,
    status: "completed",
    contract_id: contractId,
    audit_receipt: audit.audit_receipt ?? {},
    ...analysis ? { analysis } : {}
  };
}
function toolResult(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    details: data
  };
}

// src/index.ts
var INVOICE_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "OCR Extract and Validate Invoice",
    next_step_id: "verify",
    config: {
      model: "qwen/qwen3-vl-32b-instruct",
      api_key_env: "OCR_LLM_KEY",
      system_prompt: "You are an invoice OCR and validation agent. The user message contains the invoice image. Extract all fields and validate. Return ONLY a JSON object with: document_id, vendor_name, vendor_iban, vendor_tax_id, total_amount (number), currency (ISO-4217), invoice_date (ISO-8601), due_date (ISO-8601), po_reference (null if missing), subtotal (number), tax_amount (number), line_items (array of {description, quantity, unit_price, amount}), review_decision (pass_to_ap/hold_for_review/reject), vendor_status (known/unknown/blocked), po_match (matched/partial/not_found), duplicate_flag (bool), ocr_confidence (0.0-1.0), risk_score (0.0-1.0), findings (list of {code, severity, summary}), requires_human_approval (bool), decision_reasoning (string)."
    }
  },
  { step_id: "verify", step_type: "verification", title: "Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "AP Decision Gate",
    config: {
      decision_kind: "invoice_approval",
      question: "Invoice processing complete. Select action:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve", label: "Approve \u2014 process payment" },
        { option_id: "reject", label: "Reject \u2014 notify vendor" },
        { option_id: "escalate_accountant", label: "Escalate to accountant" },
        { option_id: "request_info", label: "Request more information" }
      ],
      route_map: { approve: "__end__", reject: "__end__", escalate_accountant: "__end__", request_info: "__end__", _default: "__end__" }
    }
  }
];
var PO_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "PO Risk Analysis",
    next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini",
      api_key_env: "LLM_KEY",
      system_prompt: "You are a procurement risk analyst. Review the purchase order data provided and run all connector checks. Return ONLY a JSON object with: po_id, review_decision (approve/hold/reject/escalate), approval_tier (manager/director/board), budget_check ({within_budget, utilization_pct, budget_remaining}), vendor_status (registered/pending/blacklisted), authority_check ({adequate, reason}), anomaly_flags (array), findings (array of {code, severity, summary}), requires_human_approval (bool), recommended_action (approve/hold/reject/escalate), decision_reasoning (string), risk_score (0.0-1.0)."
    }
  },
  { step_id: "verify", step_type: "verification", title: "Procurement Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "Procurement Decision Gate",
    config: {
      decision_kind: "procurement_review",
      question: "AI analysis complete. Select the procurement decision:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve", label: "Approve PO" },
        { option_id: "hold", label: "Hold for review" },
        { option_id: "reject", label: "Reject PO" },
        { option_id: "escalate", label: "Escalate to director/board" }
      ],
      route_map: { approve: "__end__", hold: "__end__", reject: "__end__", escalate: "__end__", _default: "__end__" }
    }
  }
];
var TRADE_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "Trade Risk Analysis",
    next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini",
      api_key_env: "LLM_KEY",
      system_prompt: "You are a crypto trade risk analyst. Review the trade order data and run all risk checks. Return ONLY a JSON object with: trade_id, review_decision (approve/reject/escalate_human), risk_level (low/medium/high/critical), market_check ({price_usd, volatility_score, change_24h_pct}), balance_check ({sufficient, available_margin}), portfolio_risk ({concentration_pct, risk_level, var_1d_usd}), sanctions_check ({is_sanctioned, is_pep, list_name}), anomaly_flags (array), findings (array of {code, severity, summary}), rejection_reasons (array), requires_human_approval (bool), decision_reasoning (string), risk_score (0.0-1.0). IMMEDIATE REJECT: sanctions hit OR leverage > 10x. MANDATORY ESCALATE: order_size_usd >= 10000 OR leverage > 3."
    }
  },
  { step_id: "verify", step_type: "verification", title: "Trade Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "Trading Decision Gate",
    config: {
      decision_kind: "trade_review",
      question: "Trade risk analysis complete. Select trading decision:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve", label: "Approve trade" },
        { option_id: "reject", label: "Reject trade" },
        { option_id: "escalate_human", label: "Escalate to human trader" }
      ],
      route_map: { approve: "__end__", reject: "__end__", escalate_human: "__end__", _default: "__end__" }
    }
  }
];
var COMPLAINTS_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "Complaint Classification & Risk Analysis",
    next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini",
      api_key_env: "LLM_KEY",
      system_prompt: "You are an EU financial services complaints handler. Review the complaint data and classify it. Return ONLY a JSON object with: complaint_id, triage_decision (routine/manual_review/blocked), product_risk (low/medium/high), sentiment_flags (array: compensation_claim, regulator_threat, fraud_signal, urgent), repeat_customer (bool), completeness_check ({text_present, channel_valid, product_identified}), anomaly_flags (array), findings (array of {code, severity, summary}), requires_human_approval (bool), recommended_action (auto_resolve/manual_review/reject_incomplete), decision_reasoning (string), risk_score (0.0-1.0), draft_response_hint (string). MANDATORY HUMAN REVIEW: compensation claim OR regulator threat OR repeat customer OR product_risk=high OR fraud_signal. BLOCKED: complaint_text empty or under 10 characters."
    }
  },
  { step_id: "verify", step_type: "verification", title: "Complaint Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "Complaints Handler Decision Gate",
    config: {
      decision_kind: "complaint_review",
      question: "Complaint classification complete. Select handling decision:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "resolve", label: "Resolve \u2014 send standard response" },
        { option_id: "escalate", label: "Escalate to complaints officer" },
        { option_id: "reject", label: "Reject \u2014 incomplete or invalid" },
        { option_id: "regulator_flag", label: "Flag for regulator reporting" }
      ],
      route_map: { resolve: "__end__", escalate: "__end__", reject: "__end__", regulator_flag: "__end__", _default: "__end__" }
    }
  }
];
var AML_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "AML Alert Triage Analysis",
    next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini",
      api_key_env: "LLM_KEY",
      system_prompt: "You are an AML compliance analyst performing L1 alert triage. Review the alert data and run all connector checks. Return ONLY a JSON object with: alert_id, triage_decision (false_positive/manual_review/immediate_escalate), risk_score_assessment (0-100), sanctions_check ({is_sanctioned, list_name}), pep_check ({is_pep, pep_category}), typology_match ({matched, typology_code, description}), customer_risk ({rating, jurisdiction_risk, burst_intensity}), anomaly_flags (array), findings (array of {code, severity, summary}), requires_human_approval (bool), recommended_action (clear/escalate_l2/immediate_escalate), decision_reasoning (string), risk_score (0.0-1.0). IMMEDIATE ESCALATE: sanctions_match=true OR pep_status=true OR risk_score > 85. FALSE POSITIVE: risk_score <= 30 AND no sanctions AND no PEP AND no prior alerts."
    }
  },
  { step_id: "verify", step_type: "verification", title: "AML Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "AML Triage Decision Gate",
    config: {
      decision_kind: "aml_triage",
      question: "AML L1 triage complete. Select compliance decision:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "clear", label: "Clear \u2014 false positive" },
        { option_id: "escalate_l2", label: "Escalate to L2 analyst" },
        { option_id: "immediate_escalate", label: "Immediate escalation \u2014 freeze account" }
      ],
      route_map: { clear: "__end__", escalate_l2: "__end__", immediate_escalate: "__end__", _default: "__end__" }
    }
  }
];
var COMPLIANCE_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "Compliance Rules Check",
    next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini",
      api_key_env: "LLM_KEY",
      system_prompt: "You are a compliance auditor. Review the document data against the specified regulatory framework. Return ONLY a JSON object with: document_id, framework, pass_count (int), total_checks (int), critical_count (int), findings (array of {code, severity, summary, recommendation}), requires_human_approval (bool), recommended_action (approve/approve_with_conditions/reject/request_corrections), decision_reasoning (string), risk_score (0.0-1.0). Be thorough and flag any gaps in the document against the framework requirements."
    }
  },
  { step_id: "verify", step_type: "verification", title: "Compliance Findings Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "Compliance Audit Decision Gate",
    config: {
      decision_kind: "compliance_audit",
      question: "Compliance audit complete. Select decision:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve", label: "Approve \u2014 document is compliant" },
        { option_id: "approve_with_conditions", label: "Approve with conditions \u2014 list remediation items in reason" },
        { option_id: "reject", label: "Reject \u2014 document fails compliance" },
        { option_id: "request_corrections", label: "Return for corrections" }
      ],
      route_map: { approve: "__end__", approve_with_conditions: "__end__", reject: "__end__", request_corrections: "__end__", _default: "__end__" }
    }
  }
];
var CREDIT_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "Credit Risk Scoring",
    next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini",
      api_key_env: "LLM_KEY",
      system_prompt: "You are a credit risk analyst. Evaluate the applicant's creditworthiness based on the provided financial data. Return ONLY a JSON object with: applicant_id, score (0-1000), risk_band (excellent/good/fair/poor/very_poor), recommended_limit (number), debt_to_income_ratio (number), key_factors (array of {factor, impact: positive/negative, weight}), model_version (string), findings (array of {code, severity, summary}), requires_human_approval (bool), recommended_action (approve/approve_reduced/reject/request_info), decision_reasoning (string), risk_score (0.0-1.0). MANDATORY HUMAN APPROVAL for all decisions."
    }
  },
  { step_id: "verify", step_type: "verification", title: "Credit Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "Credit Decision Gate",
    config: {
      decision_kind: "credit_decision",
      question: "Credit scoring complete. Select credit decision:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve", label: "Approve at recommended limit" },
        { option_id: "approve_reduced", label: "Approve at reduced limit \u2014 specify amount in reason" },
        { option_id: "reject", label: "Reject application" },
        { option_id: "request_info", label: "Request additional documents" }
      ],
      route_map: { approve: "__end__", approve_reduced: "__end__", reject: "__end__", request_info: "__end__", _default: "__end__" }
    }
  }
];
var SUPPLY_CHAIN_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "Supplier Screening & Risk Analysis",
    next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini",
      api_key_env: "LLM_KEY",
      system_prompt: "You are a supply chain risk analyst. Screen each supplier against sanctions lists, PEP registries, ESG ratings, and financial stability indicators. Return ONLY a JSON object with: total_count (int), critical_count (int), high_count (int), clean_count (int), results (array of {id, name, country, risk_band: low/medium/high/critical, sanctions_match: bool, pep_match: bool, esg_rating, financial_stability, findings: array}), requires_human_approval (bool), recommended_action (approve_all/approve_clean/reject_all/escalate), decision_reasoning (string), risk_score (0.0-1.0)."
    }
  },
  { step_id: "verify", step_type: "verification", title: "Supply Chain Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "Supply Chain Approval Gate",
    config: {
      decision_kind: "supply_chain_review",
      question: "Supplier screening complete. Select procurement decision:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve_all", label: "Approve all screened suppliers" },
        { option_id: "approve_clean", label: "Approve clean suppliers only \u2014 block high-risk" },
        { option_id: "reject_all", label: "Block entire batch \u2014 pending further review" },
        { option_id: "escalate", label: "Escalate to compliance team" }
      ],
      route_map: { approve_all: "__end__", approve_clean: "__end__", reject_all: "__end__", escalate: "__end__", _default: "__end__" }
    }
  }
];
var CHURN_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "Churn Risk Prediction",
    next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini",
      api_key_env: "LLM_KEY",
      system_prompt: "You are a customer retention analyst. Analyze customer behavior signals and predict churn risk. Return ONLY a JSON object with: segment_id, total_analyzed (int), at_risk_count (int), avg_churn_score (number), model_version (string), top_at_risk (array of {customer_id, churn_score, top_factor, recommended_action}), key_signals (array of {signal, importance}), findings (array of {code, severity, summary}), requires_human_approval (bool), recommended_action (launch_campaign/launch_selective/defer/escalate), decision_reasoning (string), risk_score (0.0-1.0)."
    }
  },
  { step_id: "verify", step_type: "verification", title: "Churn Risk Snapshot", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "Retention Campaign Decision Gate",
    config: {
      decision_kind: "churn_retention",
      question: "Churn analysis complete. Select retention action:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "launch_campaign", label: "Launch retention campaign for all high-risk customers" },
        { option_id: "launch_selective", label: "Launch for top-N only \u2014 specify N in reason" },
        { option_id: "defer", label: "Defer to next review cycle" },
        { option_id: "escalate", label: "Escalate to VP of Customer Success" }
      ],
      route_map: { launch_campaign: "__end__", launch_selective: "__end__", defer: "__end__", escalate: "__end__", _default: "__end__" }
    }
  }
];
var CONTRACT_GEN_STEPS = [
  {
    step_id: "analyze",
    step_type: "ai_task",
    title: "Legal Document Draft Generation",
    next_step_id: "verify",
    config: {
      model: "openai/gpt-4o-mini",
      api_key_env: "LLM_KEY",
      system_prompt: "You are a legal document specialist. Generate a structured legal document draft from the provided parameters. Return ONLY a JSON object with: document_id (string), doc_type, party_a, party_b, jurisdiction, sections (array of {section_id, title, content}), terms_extracted (object), findings (array of {code, severity, summary}), requires_human_approval (bool, always true), recommended_action (always 'review_sections'), decision_reasoning (string), risk_score (0.0-1.0). Generate complete and legally coherent section content. Do not include legal advice disclaimers in the JSON."
    }
  },
  { step_id: "verify", step_type: "verification", title: "Document Draft Ready for Review", next_step_id: "decide", config: { recommended_action: "review" } },
  {
    step_id: "decide",
    step_type: "decision_point",
    title: "Legal Review & Sign-off Gate",
    config: {
      decision_kind: "contract_review",
      question: "Document draft generated. Select review action:",
      required_actor: { actor_type: "human" },
      options: [
        { option_id: "approve_section", label: "Approve current section as written" },
        { option_id: "edit_section", label: "Accept with edits \u2014 provide edited text in reason" },
        { option_id: "reject_section", label: "Reject section \u2014 request redraft" },
        { option_id: "escalate", label: "Escalate to senior legal counsel" }
      ],
      route_map: { approve_section: "__end__", edit_section: "__end__", reject_section: "__end__", escalate: "__end__", _default: "__end__" }
    }
  }
];
var CONTRACT_SCHEMAS = {
  invoice: [
    { field: "file_url", question: "Provide the direct HTTPS URL to the invoice document (PDF, JPEG or PNG).", example: "https://example.com/invoice.jpg", required: true },
    { field: "document_id", question: "Provide a document ID, or reply 'skip' to auto-generate.", example: "INV-2026-0441", required: false }
  ],
  po: [
    { field: "po_id", question: "What is the purchase order number?", example: "PO-2026-001", required: true },
    { field: "approver_employee_id", question: "What is the HR employee ID of the approver?", example: "EMP-1042", required: true }
  ],
  trade: [
    { field: "trade_id", question: "What is the trade order ID?", example: "TRD-2026-0001", required: true },
    { field: "wallet_address", question: "What is the wallet address to screen?", example: "0xabc123\u2026", required: true },
    { field: "chain", question: "Which blockchain network?", example: "ethereum", required: true },
    { field: "token_pair", question: "Which token pair?", example: "BTC/USDT", required: true },
    { field: "side", question: "Buy or sell?", example: "buy", required: true },
    { field: "order_type", question: "What order type?", example: "market", required: true },
    { field: "order_size_usd", question: "What is the order size in USD?", example: "5000", required: true },
    { field: "leverage", question: "What leverage multiplier? (1 = no leverage)", example: "1", required: true }
  ],
  complaint: [
    { field: "complaint_id", question: "What is the complaint ID?", example: "CMP-2026-1001", required: true },
    { field: "customer_id", question: "What is the customer ID?", example: "C-789", required: true },
    { field: "complaint_text", question: "Provide the full complaint text.", example: "Payment deducted twice\u2026", required: true },
    { field: "channel", question: "Through which channel was the complaint submitted?", example: "web, email, phone, chat", required: true },
    { field: "product_category", question: "Which product or service category does this complaint concern?", example: "payments, mortgage, insurance", required: true },
    { field: "complaint_date", question: "What is the complaint date (ISO format)?", example: "2026-03-25", required: true }
  ],
  aml: [
    { field: "alert_id", question: "What is the AML alert ID?", example: "ALERT-1002", required: true },
    { field: "rule_id", question: "What is the transaction monitoring rule ID?", example: "TM-STRUCT-11", required: true },
    { field: "rule_description", question: "Describe the rule that triggered the alert.", example: "Structuring pattern", required: true },
    { field: "risk_score", question: "What is the risk score (0\u2013100)?", example: "72", required: true },
    { field: "customer_id", question: "What is the customer ID?", example: "C-1042", required: true },
    { field: "customer_name", question: "What is the customer's full name?", example: "Ivan Petrov", required: true },
    { field: "customer_risk_rating", question: "What is the customer risk rating?", example: "low, medium, or high", required: true },
    { field: "customer_type", question: "Is the customer an individual or a business?", example: "individual", required: true },
    { field: "customer_jurisdiction", question: "What is the customer's jurisdiction (ISO 3166-1 alpha-2)?", example: "DE", required: true },
    { field: "triggered_transactions", question: "List the triggered transactions as a JSON array.", example: '[{"transaction_id":"TXN-001","amount_eur":9800}]', required: true },
    { field: "pep_status", question: "Is the customer a Politically Exposed Person (PEP)? (true/false)", example: "false", required: true },
    { field: "sanctions_match", question: "Is there a sanctions list match? (true/false)", example: "false", required: true }
  ],
  compliance: [
    { field: "document_url", question: "Provide the direct HTTPS URL to the document to audit (PDF, DOCX, or image).", example: "https://example.com/policy.pdf", required: true },
    { field: "framework", question: "Which compliance framework to check against?", example: "gdpr, pci_dss, iso_27001, soc2", required: true },
    { field: "document_id", question: "Provide a document ID, or reply 'skip' to auto-generate.", example: "POL-2026-001", required: false },
    { field: "org_name", question: "What is the organization name?", example: "Acme Corp", required: true }
  ],
  credit: [
    { field: "applicant_id", question: "What is the applicant ID?", example: "APP-2026-0042", required: true },
    { field: "monthly_income", question: "What is the applicant's monthly income (in local currency)?", example: "5000", required: true },
    { field: "total_debt", question: "What is the applicant's total existing debt?", example: "12000", required: true },
    { field: "credit_history_months", question: "How many months of credit history does the applicant have?", example: "36", required: true },
    { field: "bureau_score", question: "What is the credit bureau score?", example: "720", required: true },
    { field: "requested_amount", question: "What loan amount is being requested?", example: "25000", required: true },
    { field: "loan_purpose", question: "What is the purpose of the loan?", example: "home, auto, business, personal", required: true }
  ],
  supply_chain: [
    { field: "suppliers", question: "Provide the supplier list as a JSON array with id, name, and country fields.", example: '[{"id":"SUP-001","name":"Acme GmbH","country":"DE"}]', required: true },
    { field: "category", question: "What is the procurement category?", example: "raw_materials, logistics, technology, services", required: true },
    { field: "requestor_id", question: "What is the requestor employee ID?", example: "EMP-1042", required: true }
  ],
  churn: [
    { field: "segment_id", question: "What is the customer segment ID to analyze?", example: "SEG-enterprise-2026", required: true },
    { field: "period_days", question: "How many days of activity history to analyze?", example: "30", required: true },
    { field: "threshold", question: "What churn probability threshold to flag (0.0\u20131.0)?", example: "0.7", required: true },
    { field: "requestor_id", question: "What is the requestor employee ID?", example: "EMP-1042", required: true }
  ],
  contract_gen: [
    { field: "doc_type", question: "What type of document to generate?", example: "nda, service_agreement, supply_contract, sla", required: true },
    { field: "party_a", question: "What is the name of Party A?", example: "Acme Corp", required: true },
    { field: "party_b", question: "What is the name of Party B?", example: "Beta LLC", required: true },
    { field: "jurisdiction", question: "What is the governing law jurisdiction?", example: "DE, US-NY, EU", required: true },
    { field: "effective_date", question: "What is the effective date (ISO format)?", example: "2026-04-01", required: true },
    { field: "template_id", question: "Provide a template ID, or reply 'skip' to use the default template.", example: "TMPL-NDA-001", required: false }
  ]
};
var START_TOOL = {
  invoice: "mova_hitl_start",
  po: "mova_hitl_start_po",
  trade: "mova_hitl_start_trade",
  complaint: "mova_hitl_start_complaint",
  aml: "mova_hitl_start_aml",
  compliance: "mova_hitl_start_compliance",
  credit: "mova_hitl_start_credit",
  supply_chain: "mova_hitl_start_supply_chain",
  churn: "mova_hitl_start_churn",
  contract_gen: "mova_hitl_start_contract_gen"
};
var plugin = {
  id: "mova",
  name: "MOVA",
  description: "HITL contract execution \u2014 invoice OCR, PO approval, AML triage, complaints, crypto trade review, connector registry.",
  register(api) {
    function cfg() {
      const c = api.pluginConfig;
      if (!c?.apiKey) throw new Error("MOVA API key not configured. Set it with: openclaw config set plugins.entries.mova.config.apiKey YOUR_KEY");
      return { apiKey: c.apiKey, baseUrl: c.baseUrl ?? "https://api.mova-lab.eu" };
    }
    api.registerTool({
      name: "mova_hitl_start",
      label: "MOVA: Submit Invoice",
      description: "Submit a financial document (invoice, receipt, bill) for OCR extraction and human-in-the-loop approval.",
      parameters: Type.Object({
        file_url: Type.String({ description: "Direct HTTPS URL to the document image (PDF, JPEG, PNG)" }),
        document_id: Type.Optional(Type.String({ description: "Optional document ID (auto-generated if not provided)" }))
      }),
      async execute(_id, p) {
        const config = cfg();
        const docId = p.document_id || `INV-${shortId().toUpperCase()}`;
        const contractId = `ctr-invoice-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.finance.invoice_ocr_hitl_v0",
              policy_profile_ref: "policy.hitl.finance.invoice_ocr_v0",
              initial_inputs: [
                { key: "document_id", value: docId },
                { key: "document_type", value: "invoice" },
                { key: "file_url", value: p.file_url }
              ]
            }
          },
          steps: INVOICE_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_start_po",
      label: "MOVA: Submit Purchase Order",
      description: "Submit a purchase order for automated risk analysis and human procurement approval.",
      parameters: Type.Object({
        po_id: Type.String({ description: "Purchase order number, e.g. PO-2026-001" }),
        approver_employee_id: Type.String({ description: "HR employee ID of the approver, e.g. EMP-1042" })
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-po-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.erp.po_approval_hitl_v0",
              policy_profile_ref: "policy.hitl.erp.po_approval_v0",
              initial_inputs: [
                { key: "po_id", value: p.po_id },
                { key: "approver_employee_id", value: p.approver_employee_id }
              ]
            }
          },
          steps: PO_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_start_trade",
      label: "MOVA: Submit Trade Order",
      description: "Submit a crypto trade order for sanctions screening, portfolio risk analysis, and human decision gate. Mandatory escalation for orders \u2265 $10,000 or leverage > 3x.",
      parameters: Type.Object({
        trade_id: Type.String({ description: "Trade order ID, e.g. TRD-2026-0001" }),
        wallet_address: Type.String({ description: "Wallet address to screen" }),
        chain: Type.String({ description: "Blockchain, e.g. ethereum, bitcoin, solana" }),
        token_pair: Type.String({ description: "Token pair, e.g. BTC/USDT" }),
        side: Type.Union([Type.Literal("buy"), Type.Literal("sell")]),
        order_type: Type.String({ description: "Order type: market, limit, stop" }),
        order_size_usd: Type.Number({ description: "Order size in USD" }),
        leverage: Type.Number({ description: "Leverage multiplier, 1 = no leverage" })
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-trade-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.crypto.trade_review_hitl_v0",
              policy_profile_ref: "policy.hitl.crypto.trade_review_v0",
              initial_inputs: [
                { key: "trade_id", value: p.trade_id },
                { key: "wallet_address", value: p.wallet_address },
                { key: "chain", value: p.chain },
                { key: "token_pair", value: p.token_pair },
                { key: "side", value: p.side },
                { key: "order_type", value: p.order_type },
                { key: "order_size_usd", value: String(p.order_size_usd) },
                { key: "leverage", value: String(p.leverage) }
              ]
            }
          },
          steps: TRADE_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_start_aml",
      label: "MOVA: Submit AML Alert",
      description: "Submit an AML transaction monitoring alert for automated L1 triage: sanctions screening, PEP check, typology matching, and human compliance decision gate.",
      parameters: Type.Object({
        alert_id: Type.String({ description: "Alert ID, e.g. ALERT-1002" }),
        rule_id: Type.String({ description: "TM rule ID, e.g. TM-STRUCT-11" }),
        rule_description: Type.String({ description: "Human-readable rule description" }),
        risk_score: Type.Number({ description: "Risk score 0\u2013100" }),
        customer_id: Type.String(),
        customer_name: Type.String(),
        customer_risk_rating: Type.Union([Type.Literal("low"), Type.Literal("medium"), Type.Literal("high")]),
        customer_type: Type.Union([Type.Literal("individual"), Type.Literal("business")]),
        customer_jurisdiction: Type.String({ description: "ISO 3166-1 alpha-2 country code, e.g. DE" }),
        triggered_transactions: Type.Array(
          Type.Object({ transaction_id: Type.String(), amount_eur: Type.Number() }),
          { description: "Transactions that triggered the alert" }
        ),
        pep_status: Type.Boolean(),
        sanctions_match: Type.Boolean(),
        historical_alerts: Type.Optional(Type.Array(Type.String()))
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-aml-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.aml.alert_triage_hitl_v0",
              policy_profile_ref: "policy.hitl.aml.alert_triage_v0",
              initial_inputs: [
                { key: "alert_id", value: p.alert_id },
                { key: "rule_id", value: p.rule_id },
                { key: "rule_description", value: p.rule_description },
                { key: "risk_score", value: String(p.risk_score) },
                { key: "customer_id", value: p.customer_id },
                { key: "customer_name", value: p.customer_name },
                { key: "customer_risk_rating", value: p.customer_risk_rating },
                { key: "customer_type", value: p.customer_type },
                { key: "customer_jurisdiction", value: p.customer_jurisdiction },
                { key: "triggered_transactions", value: JSON.stringify(p.triggered_transactions) },
                { key: "pep_status", value: String(p.pep_status) },
                { key: "sanctions_match", value: String(p.sanctions_match) },
                { key: "historical_alerts", value: JSON.stringify(p.historical_alerts ?? []) }
              ]
            }
          },
          steps: AML_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_start_complaint",
      label: "MOVA: Submit Complaint",
      description: "Submit a customer complaint for EU-compliant AI classification and human decision gate.",
      parameters: Type.Object({
        complaint_id: Type.String({ description: "Complaint ID, e.g. CMP-2026-1001" }),
        customer_id: Type.String(),
        complaint_text: Type.String({ description: "Full complaint text" }),
        channel: Type.String({ description: "Submission channel: web, email, phone, chat, branch" }),
        product_category: Type.String({ description: "e.g. payments, mortgage, insurance" }),
        complaint_date: Type.String({ description: "ISO date, e.g. 2026-03-19" }),
        previous_complaints: Type.Optional(Type.Array(Type.String())),
        attachments: Type.Optional(Type.Array(Type.String())),
        customer_segment: Type.Optional(Type.String()),
        preferred_language: Type.Optional(Type.String())
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-cmp-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.complaints.handler_hitl_v0",
              policy_profile_ref: "policy.hitl.complaints.handler_v0",
              initial_inputs: [
                { key: "complaint_id", value: p.complaint_id },
                { key: "customer_id", value: p.customer_id },
                { key: "complaint_text", value: p.complaint_text },
                { key: "channel", value: p.channel },
                { key: "product_category", value: p.product_category },
                { key: "complaint_date", value: p.complaint_date },
                { key: "previous_complaints", value: JSON.stringify(p.previous_complaints ?? []) },
                { key: "attachments", value: JSON.stringify(p.attachments ?? []) },
                { key: "customer_segment", value: p.customer_segment ?? "" },
                { key: "preferred_language", value: p.preferred_language ?? "en" }
              ]
            }
          },
          steps: COMPLAINTS_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_start_compliance",
      label: "MOVA: Start Compliance Audit",
      description: "Submit a document for compliance audit against GDPR, PCI-DSS, ISO 27001, or SOC 2 with a human-in-the-loop review gate.",
      parameters: Type.Object({
        document_url: Type.String({ description: "Direct HTTPS URL to the document (PDF, DOCX, or image)" }),
        framework: Type.String({ description: "Compliance framework: gdpr, pci_dss, iso_27001, soc2" }),
        org_name: Type.String({ description: "Organization name" }),
        document_id: Type.Optional(Type.String({ description: "Document ID (auto-generated if omitted)" }))
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-cmp-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.compliance.audit_hitl_v0",
              policy_profile_ref: "policy.hitl.compliance.audit_v0",
              initial_inputs: [
                { key: "document_url", value: p.document_url },
                { key: "framework", value: p.framework },
                { key: "org_name", value: p.org_name },
                { key: "document_id", value: p.document_id ?? `DOC-${shortId()}` }
              ]
            }
          },
          steps: COMPLIANCE_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_start_credit",
      label: "MOVA: Start Credit Scoring",
      description: "Submit applicant data for automated credit risk scoring and human approval gate before issuing a credit decision.",
      parameters: Type.Object({
        applicant_id: Type.String({ description: "Applicant ID, e.g. APP-2026-0042" }),
        monthly_income: Type.Number({ description: "Monthly income in local currency" }),
        total_debt: Type.Number({ description: "Total existing debt" }),
        credit_history_months: Type.Number({ description: "Months of credit history" }),
        bureau_score: Type.Number({ description: "Credit bureau score" }),
        requested_amount: Type.Number({ description: "Requested loan amount" }),
        loan_purpose: Type.String({ description: "Loan purpose: home, auto, business, personal" })
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-crd-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.credit.scoring_hitl_v0",
              policy_profile_ref: "policy.hitl.credit.scoring_v0",
              initial_inputs: [
                { key: "applicant_id", value: p.applicant_id },
                { key: "monthly_income", value: String(p.monthly_income) },
                { key: "total_debt", value: String(p.total_debt) },
                { key: "credit_history_months", value: String(p.credit_history_months) },
                { key: "bureau_score", value: String(p.bureau_score) },
                { key: "requested_amount", value: String(p.requested_amount) },
                { key: "loan_purpose", value: p.loan_purpose }
              ]
            }
          },
          steps: CREDIT_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_start_supply_chain",
      label: "MOVA: Start Supply Chain Risk Analysis",
      description: "Screen a supplier list against sanctions, PEP registries, ESG ratings, and financial stability data with a human approval gate.",
      parameters: Type.Object({
        suppliers: Type.Array(Type.Object({
          id: Type.String(),
          name: Type.String(),
          country: Type.String({ description: "ISO 3166-1 alpha-2, e.g. DE" })
        }), { description: "List of suppliers to screen" }),
        category: Type.String({ description: "Procurement category: raw_materials, logistics, technology, services" }),
        requestor_id: Type.String({ description: "Requestor employee ID" })
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-scr-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.supply_chain.risk_hitl_v0",
              policy_profile_ref: "policy.hitl.supply_chain.risk_v0",
              initial_inputs: [
                { key: "suppliers", value: JSON.stringify(p.suppliers) },
                { key: "category", value: p.category },
                { key: "requestor_id", value: p.requestor_id }
              ]
            }
          },
          steps: SUPPLY_CHAIN_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_start_churn",
      label: "MOVA: Start Churn Prediction",
      description: "Analyze customer behavior signals to predict churn risk and route the retention campaign decision through a human approval gate.",
      parameters: Type.Object({
        segment_id: Type.String({ description: "Customer segment ID to analyze" }),
        period_days: Type.Number({ description: "Days of activity history to analyze, e.g. 30" }),
        threshold: Type.Number({ description: "Churn probability threshold (0.0\u20131.0), e.g. 0.7" }),
        requestor_id: Type.String({ description: "Requestor employee ID" })
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-chu-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: "tpl.churn.prediction_hitl_v0",
              policy_profile_ref: "policy.hitl.churn.prediction_v0",
              initial_inputs: [
                { key: "segment_id", value: p.segment_id },
                { key: "period_days", value: String(p.period_days) },
                { key: "threshold", value: String(p.threshold) },
                { key: "requestor_id", value: p.requestor_id }
              ]
            }
          },
          steps: CHURN_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_start_contract_gen",
      label: "MOVA: Start Contract Generation",
      description: "Generate a legal document (NDA, service agreement, supply contract, SLA) from a template with section-by-section human review gates.",
      parameters: Type.Object({
        doc_type: Type.String({ description: "Document type: nda, service_agreement, supply_contract, sla" }),
        party_a: Type.String({ description: "Party A full name" }),
        party_b: Type.String({ description: "Party B full name" }),
        jurisdiction: Type.String({ description: "Governing law jurisdiction, e.g. DE, US-NY, EU" }),
        effective_date: Type.String({ description: "Effective date in ISO format, e.g. 2026-04-01" }),
        terms: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: "Additional terms as key-value pairs" })),
        template_id: Type.Optional(Type.String({ description: "Template ID (uses default if omitted)" }))
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = `ctr-cng-${shortId()}`;
        await movaPost(config, "/api/v1/contracts", {
          envelope: {
            kind: "env.contract.start_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              template_id: p.template_id ?? `tpl.legal.${p.doc_type}_hitl_v0`,
              policy_profile_ref: "policy.hitl.legal.contract_gen_v0",
              initial_inputs: [
                { key: "doc_type", value: p.doc_type },
                { key: "party_a", value: p.party_a },
                { key: "party_b", value: p.party_b },
                { key: "jurisdiction", value: p.jurisdiction },
                { key: "effective_date", value: p.effective_date },
                { key: "terms", value: JSON.stringify(p.terms ?? {}) }
              ]
            }
          },
          steps: CONTRACT_GEN_STEPS
        });
        return toolResult(await movaRunSteps(config, contractId));
      }
    });
    api.registerTool({
      name: "mova_hitl_decide",
      label: "MOVA: Submit Decision",
      description: "Submit a human decision for a contract waiting at a human gate. Use the contract_id returned by mova_hitl_start* tools.",
      parameters: Type.Object({
        contract_id: Type.String({ description: "Contract ID from mova_hitl_start* response, e.g. ctr-inv-xxxxxxxx" }),
        option: Type.String({ description: "Decision option, e.g. approve, reject, escalate" }),
        reason: Type.Optional(Type.String({ description: "Human reasoning for the decision" }))
      }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = p.contract_id;
        const dpResp = await movaGet(config, `/api/v1/contracts/${contractId}/decision`);
        const dp = dpResp.decision_point ?? {};
        const result = await movaPost(config, `/api/v1/contracts/${contractId}/decision`, {
          envelope: {
            kind: "env.decision.submit_v0",
            envelope_id: `env-${shortId()}`,
            contract_id: contractId,
            decision_point_id: dp.decision_point_id ?? "",
            actor: { actor_type: "human", actor_id: "user" },
            payload: {
              selected_option_id: p.option,
              selection_reason: p.reason ?? "decision via MOVA plugin"
            }
          }
        });
        if (!result.ok) return toolResult(result);
        const audit = await movaGet(config, `/api/v1/contracts/${contractId}/audit`);
        return toolResult({
          ok: true,
          status: "completed",
          contract_id: contractId,
          decision: p.option,
          audit_receipt: audit.audit_receipt ?? {}
        });
      }
    });
    api.registerTool({
      name: "mova_hitl_status",
      label: "MOVA: Get Status",
      description: "Get the current status of a MOVA contract.",
      parameters: Type.Object({ contract_id: Type.String() }),
      async execute(_id, p) {
        return toolResult(await movaGet(cfg(), `/api/v1/contracts/${p.contract_id}`));
      }
    });
    api.registerTool({
      name: "mova_hitl_audit",
      label: "MOVA: Get Audit",
      description: "Get the full audit receipt for a completed MOVA contract.",
      parameters: Type.Object({ contract_id: Type.String() }),
      async execute(_id, p) {
        return toolResult(await movaGet(cfg(), `/api/v1/contracts/${p.contract_id}/audit`));
      }
    });
    api.registerTool({
      name: "mova_hitl_audit_compact",
      label: "MOVA: Get Compact Journal",
      description: "Get the compact audit journal for a contract \u2014 full signed event chain with timestamps.",
      parameters: Type.Object({ contract_id: Type.String() }),
      async execute(_id, p) {
        const config = cfg();
        const contractId = p.contract_id;
        const res = await fetch(
          `${config.baseUrl.replace(/\/$/, "")}/api/v1/contracts/${contractId}/audit/compact/sidecar.jsonl`,
          { headers: { Authorization: `Bearer ${config.apiKey}` } }
        );
        const text = await res.text();
        return toolResult({ ok: res.ok, status: res.status, journal: text });
      }
    });
    api.registerTool({
      name: "mova_calibrate_intent",
      label: "MOVA: Calibrate Intent",
      description: "Pre-flight check before starting a MOVA contract. Call this when the user's request is ambiguous or missing required fields. Pass collected answers; get back either the next required question (ASK) or confirmation that all inputs are ready (VALID). RULE: never guess or infer missing values \u2014 only pass values explicitly stated by the user.",
      parameters: Type.Object({
        contract_type: Type.String({
          description: "Contract type: invoice | po | trade | complaint | aml"
        }),
        answers: Type.Array(
          Type.Object({
            field: Type.String({ description: "Field name" }),
            value: Type.String({ description: "Value explicitly provided by the user" })
          }),
          { description: "Answers collected so far from the user. Empty array on first call." }
        )
      }),
      async execute(_id, p) {
        const contractType = p.contract_type;
        const schema = CONTRACT_SCHEMAS[contractType];
        if (!schema) {
          return toolResult({
            status: "UNKNOWN_CONTRACT_TYPE",
            message: `Unknown contract type: "${contractType}". Available: ${Object.keys(CONTRACT_SCHEMAS).join(", ")}`
          });
        }
        const answersMap = new Map(
          p.answers.map((a) => [a.field, a.value.trim()])
        );
        const required = schema.filter((f) => f.required);
        const missing = required.filter((f) => !answersMap.get(f.field));
        if (missing.length > 0) {
          const next = missing[0];
          return toolResult({
            status: "ASK",
            field: next.field,
            question: next.question,
            example: next.example,
            progress: `${required.length - missing.length} of ${required.length} required fields collected`,
            instruction: "Ask the user this question exactly. Do not attempt to answer it yourself."
          });
        }
        const resolved = {};
        for (const f of schema) {
          const val = answersMap.get(f.field);
          if (val) resolved[f.field] = val;
        }
        return toolResult({
          status: "VALID",
          contract_type: contractType,
          resolved_inputs: resolved,
          next_tool: START_TOOL[contractType],
          instruction: `All required inputs collected. Call ${START_TOOL[contractType]} with these resolved_inputs.`
        });
      }
    });
    api.registerTool({
      name: "mova_list_connectors",
      label: "MOVA: List Connectors",
      description: "List all available MOVA connectors. Optionally filter by keyword.",
      parameters: Type.Object({
        keyword: Type.Optional(Type.String({ description: "Filter keyword, e.g. erp, aml, ocr, market" }))
      }),
      async execute(_id, p) {
        const data = await movaGet(cfg(), "/api/v1/connectors");
        let list = data.connectors ?? [];
        if (p.keyword) {
          const kw = p.keyword.toLowerCase();
          list = list.filter(
            (c) => c.connector_id.toLowerCase().includes(kw) || c.display_name.toLowerCase().includes(kw) || c.description.toLowerCase().includes(kw)
          );
        }
        return toolResult({ connectors: list, total: list.length });
      }
    });
    api.registerTool({
      name: "mova_list_connector_overrides",
      label: "MOVA: List Connector Overrides",
      description: "List all connector overrides registered for your org.",
      parameters: Type.Object({}),
      async execute() {
        return toolResult(await movaGet(cfg(), "/api/v1/connectors/overrides"));
      }
    });
    api.registerTool({
      name: "mova_register_connector",
      label: "MOVA: Register Connector",
      description: "Register your own HTTPS endpoint for a MOVA connector. After registration all contracts in your org will call your endpoint instead of the sandbox mock.",
      parameters: Type.Object({
        connector_id: Type.String({ description: "Connector ID, e.g. connector.erp.po_lookup_v1" }),
        endpoint: Type.String({ description: "Your HTTPS endpoint URL" }),
        label: Type.Optional(Type.String({ description: "Human-readable label" })),
        auth_header: Type.Optional(Type.String({ description: "Auth header name, e.g. X-Api-Key" })),
        auth_value: Type.Optional(Type.String({ description: "Auth header value" }))
      }),
      async execute(_id, p) {
        return toolResult(await movaPut(cfg(), `/api/v1/connectors/${p.connector_id}/override`, {
          endpoint: p.endpoint,
          label: p.label,
          auth_header: p.auth_header,
          auth_value: p.auth_value
        }));
      }
    });
    api.registerTool({
      name: "mova_delete_connector_override",
      label: "MOVA: Remove Connector Override",
      description: "Remove a connector override \u2014 the connector reverts to the MOVA sandbox mock.",
      parameters: Type.Object({
        connector_id: Type.String({ description: "Connector ID to revert" })
      }),
      async execute(_id, p) {
        return toolResult(await movaDelete(cfg(), `/api/v1/connectors/${p.connector_id}/override`));
      }
    });
  }
};
var index_default = plugin;
export {
  index_default as default
};
