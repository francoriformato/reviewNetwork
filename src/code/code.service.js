const addLocalCode = (Code) => ({ id, cbookTitle, stillValid, codeList }) => {
  const code = new Code({
    id, cbookTitle, stillValid, codeList
  })
  return code.save()
}

const getCodes = (Code) => () => {
  return Code.find({})
}

const getCodeByTitle = (Code) => async ({ cbookTitle }) => {
  return await Code.findOne({ cbookTitle })
}

module.exports = (Code) => {
  return {
    addLocalCode: addLocalCode(Code),
    getCodes: getCodes(Code),
    getCodeByTitle: getCodeByTitle(Code)
  }
}