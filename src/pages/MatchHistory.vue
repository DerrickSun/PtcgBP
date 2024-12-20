<template>
  <div class="match-history">
    <div class="bp-card">
      <div class="header">
        <h2>比赛历史记录</h2>
        <div class="actions">
          <button 
            v-if="selectedMatches.length > 0" 
            class="delete-selected-btn"
            @click="deleteSelected"
          >
            删除选中 ({{ selectedMatches.length }})
          </button>
        </div>
      </div>
      
      <div class="matches-list">
        <div v-for="match in matches" :key="match.id" class="match-item">
          <!-- 基本信息 -->
          <div class="match-header">
            <div class="match-info" @click="toggleMatch(match.id)">
              <h3>{{ match.name || '未命名比赛' }}</h3>
              <span class="match-date">{{ formatDate(match.date) }}</span>
            </div>
            <div class="match-actions">
              <label class="checkbox">
                <input 
                  type="checkbox" 
                  :value="match.id"
                  v-model="selectedMatches"
                >
                <span class="checkmark"></span>
              </label>
              <button class="delete-btn" @click="deleteMatch(match.id)">删除</button>
              <button class="expand-btn" :class="{ expanded: expandedMatch === match.id }">
                <span class="arrow">›</span>
              </button>
            </div>
          </div>
          
          <!-- 展开的详细信息 -->
          <div v-show="expandedMatch === match.id" class="match-details">
            <div class="decks-list">
              <h4>我方卡组:</h4>
              <div class="deck-tags">
                <span v-for="deck in match.myDecks" :key="deck" class="deck-tag">
                  {{ deck }}
                </span>
              </div>
            </div>
            
            <div class="rounds-info">
              <h4>对战记录:</h4>
              <div v-for="(decks, round) in match.rounds" :key="round" class="round-info">
                <h5>第 {{ round }} 轮</h5>
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
                        <th v-for="oppDeck in decks" :key="oppDeck" class="deck-header">
                          {{ oppDeck }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="myDeck in match.myDecks" :key="myDeck">
                        <td class="deck-header">{{ myDeck }}</td>
                        <td 
                          v-for="oppDeck in decks" 
                          :key="oppDeck"
                          :style="getWinRateStyle(winRates[myDeck.replace(/ [0-9]+$/, '')]?.[oppDeck.replace(/ [0-9]+$/, '')])"
                          class="win-rate-cell"
                        >
                          {{ winRates[myDeck.replace(/ [0-9]+$/, '')]?.[oppDeck.replace(/ [0-9]+$/, '')] }}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { readExcelFile } from '../utils/excelReader'

const matches = ref([])
const expandedMatch = ref(null)
const winRates = ref({})
const selectedMatches = ref([])  // 存储选中的比赛ID

// 切换展开/收起
const toggleMatch = (matchId) => {
  expandedMatch.value = expandedMatch.value === matchId ? null : matchId
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 胜率样式计算方法
const getWinRateStyle = (winRate) => {
  if (!winRate) return {}
  
  let color
  if (winRate >= 60) {
    color = 'rgba(40, 167, 69, 0.9)'  // 深绿
  } else if (winRate >= 55) {
    color = 'rgba(111, 207, 151, 0.85)'  // 浅绿
  } else if (winRate > 45 && winRate < 55) {
    color = 'rgba(255, 193, 7, 0.8)'  // 黄色
  } else if (winRate >= 40) {
    color = 'rgba(255, 107, 107, 0.85)'  // 浅红
  } else {
    color = 'rgba(220, 53, 69, 0.9)'  // 深红
  }
  
  return {
    backgroundColor: color,
    color: winRate >= 55 || winRate <= 45 ? '#fff' : '#000',
    fontWeight: '500'
  }
}

// 删除单个比赛
const deleteMatch = (id) => {
  if (confirm('确定要删除这场比赛记录吗？')) {
    matches.value = matches.value.filter(match => match.id !== id)
    localStorage.setItem('ptcg_bp_matches', JSON.stringify(matches.value))
  }
}

// 批量删除选中的比赛
const deleteSelected = () => {
  if (confirm(`确定要删除选中的 ${selectedMatches.value.length} 场比赛记录吗？`)) {
    matches.value = matches.value.filter(match => !selectedMatches.value.includes(match.id))
    localStorage.setItem('ptcg_bp_matches', JSON.stringify(matches.value))
    selectedMatches.value = []  // 清空选中
  }
}

onMounted(async () => {
  // 加载胜率数据
  const data = await readExcelFile('./win_rates.xlsx')
  if (data) {
    winRates.value = data.winRates
  }
  
  // 加载历史记录并按时间倒序排序
  const savedMatches = localStorage.getItem('ptcg_bp_matches')
  if (savedMatches) {
    matches.value = JSON.parse(savedMatches).sort((a, b) => {
      return new Date(b.date) - new Date(a.date)  // 按日期倒序排序
    })
  }
})
</script>

<style scoped>
.match-history {
  padding: 1rem;
}

.bp-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: #f8f9fa;
  transition: background-color 0.3s;
}

.match-header:hover {
  background: #f1f3f5;
}

.match-info {
  flex: 1;
}

.match-info h3 {
  margin: 0;
  color: #2c3e50;
}

.match-date {
  color: #666;
  font-size: 0.9rem;
}

.match-summary {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.expand-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.arrow {
  display: inline-block;
  transform: rotate(90deg);
  transition: transform 0.3s;
  font-size: 1.2rem;
}

.expanded .arrow {
  transform: rotate(270deg);
}

.match-details {
  padding: 1rem;
  border-top: 1px solid #eee;
}

.deck-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.deck-tag {
  background: #f5f5f5;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.rounds-info {
  margin-top: 1.5rem;
}

.round-info {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.round-info h5 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.new-match-btn {
  width: 100%;
  padding: 1rem;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 2rem;
  transition: all 0.3s;
}

.new-match-btn:hover {
  background: #27ae60;
}

@media (max-width: 768px) {
  .match-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .match-summary {
    width: 100%;
    justify-content: space-between;
  }
}

/* 添加新样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.match-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.delete-btn {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: #c0392b;
}

.delete-selected-btn {
  padding: 0.75rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.delete-selected-btn:hover {
  background: #c0392b;
}

/* 复选框样式 */
.checkbox {
  position: relative;
  cursor: pointer;
  user-select: none;
  width: 20px;
  height: 20px;
}

.checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #eee;
  border-radius: 4px;
  transition: all 0.3s;
}

.checkbox:hover input ~ .checkmark {
  background-color: #ccc;
}

.checkbox input:checked ~ .checkmark {
  background-color: #2ecc71;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox input:checked ~ .checkmark:after {
  display: block;
}

.checkbox .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style> 