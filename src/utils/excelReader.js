import * as XLSX from 'xlsx'

export const readExcelFile = async (filePath) => {
  try {
    const response = await fetch(filePath)
    const arrayBuffer = await response.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    // 第一行是防守方卡组名（去掉第一个空单元格）
    const decks = jsonData[0].slice(1)
    
    // 构建胜率数据对象
    const winRates = {}
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      const attackDeck = row[0]
      winRates[attackDeck] = {}
      
      for (let j = 1; j < row.length; j++) {
        const defendDeck = decks[j-1]
        winRates[attackDeck][defendDeck] = parseFloat(row[j])
      }
    }
    
    console.log('Loaded decks:', decks)
    console.log('Loaded win rates:', winRates)
    
    return {
      decks: decks,
      winRates: winRates
    }
  } catch (error) {
    console.error('Error reading Excel file:', error)
    return null
  }
} 