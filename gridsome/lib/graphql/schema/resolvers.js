function fieldResolver (obj, args, ctx, { fieldName }) {
  return obj.hasOwnProperty('$loki') // the node object
    ? obj.fields[fieldName]
    : obj[fieldName]
}

function applyArgs (chain, args) {
  if (args.sortBy) chain = chain.simplesort(args.sortBy, args.order === -1)
  if (args.skip) chain = chain.offset(args.skip)
  if (args.limit) chain = chain.limit(args.limit)

  return chain
}

function createRefResolver ({ typeName, isList = false }) {
  return function refResolver (obj, args, context, info) {
    const fieldValue = fieldResolver(obj, args, context, info)

    if (!fieldValue) return isList ? [] : null

    const { id } = fieldValue
    const query = {}
    let chain

    if (id) {
      query.id = Array.isArray(id) ? { $in: id } : id
      query.typeName = Array.isArray(typeName) ? { $in: typeName } : typeName
    } else if (Array.isArray(fieldValue)) {
      query.$or = fieldValue
    }

    if (Array.isArray(typeName)) {
      // search for multiple node types by filtering the global
      // node index before joining each node type collections
      chain = context.store.chainNodes(query)
    } else {
      const { collection } = context.store.getContentType(typeName)
      chain = collection.chain().find(query)
    }

    return isList
      ? applyArgs(chain, args).data()
      : chain.data()[0]
  }
}

module.exports = {
  fieldResolver,
  createRefResolver
}
