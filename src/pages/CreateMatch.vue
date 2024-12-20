<template>
  <div class="create-match">
    <div class="bp-card">
      <!-- 比赛创建部分 - 始终显示 -->
      <div class="match-form">
        <input 
          type="text" 
          v-model="matchName" 
          placeholder="输入比赛名称"
          class="form-input"
        >

        <div class="my-decks">   
          <div class="header">
            <h4>我方卡组 ({{ selectedDecks.length }}/6)</h4>
            <button 
              class="add-btn"
              @click="showDeckSelector = true"
            >
              选择卡组
            </button>
          </div>

          <div class="deck-list">
            <div v-for="(deck, index) in selectedDecks" :key="index" class="deck-item">
              <span>{{ deck }}</span>
              <button class="remove-btn" @click="selectedDecks.splice(index, 1)">×</button>
            </div>
          </div>
        </div>

        <button 
          v-if="!matchStarted"
          class="start-btn" 
          @click="startMatch"
          :disabled="selectedDecks.length < 4"
        >
          开始比赛
        </button>
      </div>

      <!-- 比赛进行中部分 -->
      <div v-show="matchStarted" class="match-progress">
        <div class="match-header">
          <h3>Round {{ currentRound }}</h3>
        </div>

        <!-- 选择对手卡组部分 -->
        <div v-if="!showMatchupTable" class="opponent-selection">
          <!-- 添加轮次标签 -->
          <div v-if="Object.keys(roundHistory).length > 0" class="round-tabs">
            <button 
              v-for="round in Object.keys(roundHistory)" 
              :key="round"
              :class="{ active: currentRound === Number(round) }"
              @click="switchRound(Number(round))"
              class="round-tab"
            >
              第{{ round }}轮
            </button>
            <button 
              class="round-tab current"
            >
              第{{ currentRound }}轮
            </button>
          </div>

          <div class="header">
            <h4>选择对方卡组 ({{ opponentDecks.length }}/6)</h4>
          </div>

          <!-- 已选对手卡组 -->
          <div class="selected-opponents">
            <div v-for="(deck, index) in opponentDecks" :key="index" class="deck-item">
              <span>{{ deck }}</span>
              <button class="remove-btn" @click="opponentDecks.splice(index, 1)">×</button>
            </div>
          </div>

          <!-- 可选卡组列表 -->
          <div class="deck-grid">
            <div 
              v-for="deck in availableDecks" 
              :key="deck"
              class="deck-option"
              :class="{
                'disabled': opponentDecks.length >= 6
              }"
              @click="addOpponentDeck(deck)"
            >
              {{ deck }}
            </div>
          </div>

          <button 
            class="confirm-btn"
            @click="confirmOpponents"
            :disabled="opponentDecks.length < 4 || opponentDecks.length > 6"
          >
            确认对手卡组
          </button>
        </div>

        <!-- 对阵表部分 -->
        <div v-if="showMatchupTable" class="matchup-table">
          <div v-if="Object.keys(roundHistory).length > 0" class="round-tabs">
            <button 
              v-for="round in Object.keys(roundHistory)" 
              :key="round"
              :class="{ active: currentRound === Number(round) }"
              @click="switchRound(Number(round))"
              class="round-tab"
            >
              第{{ round }}轮
            </button>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th class="corner-header">
                    <div class="corner-content">
                      <span class="attacker">进攻方</span>
                      <span class="defender">防守方</span>
                    </div>
                  </th>
                  <th v-for="oppDeck in opponentDecks" :key="oppDeck" class="deck-header">
                    {{ oppDeck }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="myDeck in selectedDecks" :key="myDeck">
                  <td class="deck-header">{{ myDeck }}</td>
                  <td 
                    v-for="oppDeck in opponentDecks" 
                    :key="oppDeck"
                    :style="getWinRateStyle(winRates[myDeck.replace(/ [0-9]+$/, '')]?.[oppDeck.replace(/ [0-9]+$/, '')], myDeck, oppDeck)"
                    class="win-rate-cell"
                  >
                    {{ winRates[myDeck.replace(/ [0-9]+$/, '')]?.[oppDeck.replace(/ [0-9]+$/, '')] }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="round-controls">
            <button class="end-btn" @click="endMatch">
              结束比赛
            </button>
            <button class="next-btn" @click="nextRound">
              下一轮
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 选择卡组窗 -->
    <div v-if="showDeckSelector" class="modal-overlay" @click="showDeckSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>选择卡组 ({{ selectedDecks.length }}/6)</h4>
          <button class="close-btn" @click="showDeckSelector = false">×</button>
        </div>
        <div class="deck-grid">
          <div 
            v-for="deck in availableDecks" 
            :key="deck"
            class="deck-option"
            :class="{
              'disabled': selectedDecks.length >= 6
            }"
            @click="addDeck(deck)"
          >
            {{ deck }}
          </div>
        </div>
      </div>
    </div>

    <!-- 确认对话框 -->
    <div v-if="showNewMatchConfirm" class="modal-overlay" @click="showNewMatchConfirm = false">
      <div class="modal-content confirm-modal" @click.stop>
        <h4>开始新比赛</h4>
        <p>当前比赛尚未结束，开始新比赛将保存当前比赛到历史记录。是否继续？</p>
        <div class="confirm-buttons">
          <button class="cancel-btn" @click="showNewMatchConfirm = false">取消</button>
          <button class="confirm-btn" @click="startNewMatch">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { readExcelFile } from '../utils/excelReader'
import { useRoute, useRouter } from 'vue-router'

// 使用 localStorage 存储当前比赛数据
const CURRENT_MATCH_KEY = 'ptcg_bp_current_match'
const MATCHES_KEY = 'ptcg_bp_matches'

const route = useRoute()
const router = useRouter()
const matchStarted = ref(false)
const matchName = ref('')
const selectedDecks = ref([])
const currentRound = ref(1)
const opponentDecks = ref([])
const availableDecks = ref([])
const winRates = ref({})
const roundHistory = ref({})
const showDeckSelector = ref(false)
const showMatchupTable = ref(false)
const showNewMatchConfirm = ref(false)  // 控制确认对话框

// 存当前比赛状态
const saveCurrentMatch = () => {
  const currentMatch = {
    id: Date.now(),
    name: matchName.value,
    myDecks: selectedDecks.value,
    rounds: roundHistory.value,
    currentRound: currentRound.value,
    matchStarted: matchStarted.value,
    date: new Date().toISOString()
  }
  console.log('Saving match:', currentMatch)
  localStorage.setItem(CURRENT_MATCH_KEY, JSON.stringify(currentMatch))
}

// 保存完整比赛记录
const saveMatchToHistory = () => {
  const matches = JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]')
  const currentMatch = {
    id: Date.now(),
    name: matchName.value,
    myDecks: selectedDecks.value,
    rounds: roundHistory.value,
    date: new Date().toISOString()
  }
  matches.push(currentMatch)
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches))
}

// 开始比赛方法
const startMatch = () => {
  console.log('Start match clicked')
  console.log('Current state:', {
    selectedDecks: selectedDecks.value,
    selectedDecksLength: selectedDecks.value.length,
    matchStarted: matchStarted.value,
    disabled: selectedDecks.value.length < 4
  })

  if (selectedDecks.value.length >= 4) {
    console.log('Conditions met, starting match...')
    matchStarted.value = true
    currentRound.value = 1
    opponentDecks.value = []
    roundHistory.value = {}
    showMatchupTable.value = false
    
    console.log('State after update:', {
      matchStarted: matchStarted.value,
      currentRound: currentRound.value,
      showMatchupTable: showMatchupTable.value
    })
    
    saveCurrentMatch()
  } else {
    console.log('Conditions not met:', {
      selectedDecksLength: selectedDecks.value.length
    })
  }
}

// 添加开始新比赛的方法
const startNewMatch = () => {
  // 如果有正在进行的比赛，保存到历史记录
  const currentMatch = localStorage.getItem(CURRENT_MATCH_KEY)
  if (currentMatch) {
    saveMatchToHistory()
    alert('当前比赛已保存到历史记录')  // 提示用户
  }
  
  // 清空当前状态
  matchStarted.value = true
  currentRound.value = 1
  opponentDecks.value = []
  roundHistory.value = {}
  showMatchupTable.value = false
  
  // 保存新比赛状态
  saveCurrentMatch()
  
  // 关闭确认对话框
  showNewMatchConfirm.value = false
}

// 添加对手卡组
const addOpponentDeck = (deck) => {
  if (opponentDecks.value.length < 6) {
    // 查是否已有相同名称的卡组
    const sameDeckCount = opponentDecks.value.filter(d => d.replace(/ [0-9]+$/, '') === deck).length
    
    if (sameDeckCount > 0) {
      // 如果有相同卡组，添加编号
      opponentDecks.value.push(`${deck} ${sameDeckCount + 1}`)
    } else {
      opponentDecks.value.push(deck)
    }
  }
}

// 修改胜率样式计算方法
const getWinRateStyle = (winRate, deck1, deck2) => {
  // 移除卡组名称后的编号
  const cleanDeck1 = deck1.replace(/ [0-9]+$/, '')
  const cleanDeck2 = deck2.replace(/ [0-9]+$/, '')
  
  // 使用原始卡组名称获取胜率
  const actualWinRate = winRates.value[cleanDeck1]?.[cleanDeck2]
  
  if (!actualWinRate) return {}
  
  let color
  if (actualWinRate >= 60) {
    // 绿色
    color = 'rgba(40, 167, 69, 0.9)'  // 深绿
  } else if (actualWinRate >= 55) {
    // 浅绿色
    color = 'rgba(111, 207, 151, 0.85)'  // 浅绿
  } else if (actualWinRate > 45 && actualWinRate < 55) {
    // 黄色
    color = 'rgba(255, 193, 7, 0.8)'  // 黄色
  } else if (actualWinRate >= 40) {
    // 浅红色
    color = 'rgba(255, 107, 107, 0.85)'  // 浅红
  } else {
    // 红色
    color = 'rgba(220, 53, 69, 0.9)'  // 深红
  }
  
  return {
    backgroundColor: color,
    color: actualWinRate >= 55 || actualWinRate <= 45 ? '#fff' : '#000',  // 深色背景用白字，浅色背景用黑字
    fontWeight: '500'
  }
}

// 修改确认对手卡组的方法
const confirmOpponents = () => {
  if (opponentDecks.value.length >= 4 && opponentDecks.value.length <= 6) {
    roundHistory.value[currentRound.value] = [...opponentDecks.value]
    showMatchupTable.value = true
    saveCurrentMatch()
  }
}

// 辑我方卡组
const editMyDecks = () => {
  matchStarted.value = false
}

// 修改下一轮的方法
const nextRound = () => {
  currentRound.value++
  opponentDecks.value = []
  showMatchupTable.value = false
  saveCurrentMatch()
}

// 只保留一 onMounted
onMounted(async () => {
  // 胜率数据
  const data = await readExcelFile('./win_rates.xlsx')
  if (data) {
    availableDecks.value = data.decks
    winRates.value = data.winRates
  }

  // 如果是继续比赛，加载之前的状态
  if (route.query.continue) {
    const savedMatch = localStorage.getItem(CURRENT_MATCH_KEY)
    if (savedMatch) {
      const match = JSON.parse(savedMatch)
      matchName.value = match.name
      selectedDecks.value = match.myDecks
      currentRound.value = match.currentRound
      roundHistory.value = match.rounds
      matchStarted.value = match.matchStarted
      
      // 如果当前轮次有对手卡组，也加载
      if (match.rounds[match.currentRound]) {
        opponentDecks.value = match.rounds[match.currentRound]
        showMatchupTable.value = true
      }
    }
  }
})

// 修改卡组选择逻辑，只许添加不允许取消
const toggleDeck = (deck) => {
  if (!selectedDecks.value.includes(deck) && selectedDecks.value.length < 6) {
    // 只有未选中且未达到上限时才能加
    selectedDecks.value.push(deck)
  }
}

// 修改对手卡组选择
const toggleOpponentDeck = (deck) => {
  if (opponentDecks.value.includes(deck)) {
    // 如果已经选中，则除
    opponentDecks.value = opponentDecks.value.filter(d => d !== deck)
  } else if (opponentDecks.value.length < 6) {
    // 如果未选中且未达到上限，则加
    opponentDecks.value.push(deck)
  }
}

// 添加卡组
const addDeck = (deck) => {
  if (selectedDecks.value.length < 6) {
    // 检查是否已有相同名称的卡组
    const sameDeckCount = selectedDecks.value.filter(d => d.replace(/ [0-9]+$/, '') === deck).length
    
    if (sameDeckCount > 0) {
      // 如果有相同卡组，添加编号
      selectedDecks.value.push(`${deck} ${sameDeckCount + 1}`)
    } else {
      selectedDecks.value.push(deck)
    }
  }
}

// 添加切换轮次的方法
const switchRound = (round) => {
  currentRound.value = round
  opponentDecks.value = [...roundHistory.value[round]]
  showMatchupTable.value = true
}

// 修改结束比赛方法
const endMatch = () => {
  if (confirm('确定要结束当前比赛吗？比赛将被保存到历史记录。')) {
    // 保存到历史记录
    saveMatchToHistory()
    
    // 清空当前比赛状态
    matchStarted.value = false
    matchName.value = ''
    selectedDecks.value = []
    currentRound.value = 1
    opponentDecks.value = []
    roundHistory.value = {}
    showMatchupTable.value = false
    
    // 删除本地存储中的当前比赛
    localStorage.removeItem(CURRENT_MATCH_KEY)
    
    // 跳转到历史记录页面
    router.push('/match/history')
  }
}
</script>

<style scoped>
.create-match {
  padding: 1rem;
}

.bp-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 表和头部样式 */
.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

/* 按钮样式 */
.add-btn, .edit-btn, .confirm-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.add-btn {
  background: #3498db;
  color: white;
}

.edit-btn {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.confirm-btn {
  background: #2ecc71;
  color: white;
}

.confirm-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.start-btn {
  width: 100%;
  padding: 1rem;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
}

.start-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  opacity: 0.7;
}

.next-btn {
  width: 100%;
  padding: 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

/* 卡组列表样式 */
.deck-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.deck-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f5f5f5;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.remove-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  line-height: 1;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  padding: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
}

/* 组选择格 */
.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.deck-option {
  padding: 0.75rem;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: center;
  transition: all 0.3s;
}

.deck-option:hover:not(.disabled) {
  background: #e3f2fd;
}

.deck-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 轮次选择器 */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.round-selector {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.round-selector button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  white-space: nowrap;
}

.round-selector button.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

/* 对手表样式 */
.matchup-table {
  margin-top: 1rem;
}

.table-wrapper {
  overflow-x: auto;
  margin: 1rem -1rem;
  padding: 0 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 修改表样式 */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #ddd;
}

td, th {
  height: 48px;
  min-width: 80px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: center;
  vertical-align: middle;
  font-size: 0.9rem;
}

.win-rate-cell {
  transition: background-color 0.3s;
  font-weight: 500;
  font-size: 0.9rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.deck-header {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  white-space: nowrap;
}

.corner-header {
  position: relative;
  width: 100px;
  height: 48px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  overflow: hidden;
}

.corner-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 创建两个区域 */
.corner-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,  /* 从左上到右下 */
    #f8f9fa 50%,    /* 左上区域（防守方） */
    #f5f5f5 50%     /* 右下区域（进攻方） */
  );
}

/* 调整文字位置 */
.attacker {
  position: absolute;
  left: 4px;
  bottom: 4px;  /* 进攻方在左下 */
  font-size: 0.8rem;
  color: #666;
  z-index: 1;
}

.defender {
  position: absolute;
  right: 4px;
  top: 4px;  /* 防守方在右上 */
  font-size: 0.8rem;
  color: #666;
  z-index: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  td, th {
    height: 40px;
    padding: 0.5rem;
    font-size: 0.8rem;
    min-width: 60px;
  }

  .corner-header {
    height: 40px;
    width: 80px;
  }

  .attacker, .defender {
    font-size: 0.7rem;
  }
}

.selected-opponents {
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.deck-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f5f5f5;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.deck-option {
  padding: 0.75rem;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: center;
  transition: all 0.3s;
}

.deck-option:hover:not(.disabled) {
  background: #e3f2fd;
}

.deck-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.confirm-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.match-progress {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

/* 加轮次切换的式 */
.round-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.round-tab {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.round-tab.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.round-tab.current {
  background: #2ecc71;
  color: white;
  border-color: #2ecc71;
}

.round-controls {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;  /* 添加按钮间距 */
  margin-top: 1rem;
}

.end-btn {
  padding: 1rem 2rem;
  background: #e74c3c;  /* 红背景 */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.end-btn:hover {
  background: #c0392b;
}

.next-btn {
  padding: 1rem 2rem;  /* 调整padding保持一致 */
  /* 其他样式保持不变 */
}

/* 确认对话框样式 */
.confirm-modal {
  max-width: 400px;
  text-align: center;
}

.confirm-modal h4 {
  margin-bottom: 1rem;
}

.confirm-modal p {
  margin-bottom: 1.5rem;
  color: #666;
}

.confirm-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #7f8c8d;
}
</style> 