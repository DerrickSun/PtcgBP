<template>
  <div class="team-bp">
    <!-- 新建比赛按钮 -->
    <button class="create-btn" @click="handleNewMatch">
      新建比赛
    </button>

    <!-- 进行中的比赛 -->
    <div v-if="currentMatch" class="bp-card current-match">
      <div class="match-info">
        <h3>{{ currentMatch.name || '未命名比赛' }}</h3>
        <div class="match-meta">
          <span>第 {{ currentMatch.currentRound }} 轮</span>
          <span>{{ currentMatch.myDecks.length }} 套卡组</span>
        </div>
      </div>
      <button class="continue-btn" @click="$router.push('/match/create?continue=true')">
        继续比赛
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentMatch = ref(null)

// 处理新建比赛
const handleNewMatch = () => {
  if (currentMatch.value) {
    if (confirm('当前有正在进行的比赛，开始新比赛将保存当前比赛到历史记录。是否继续？')) {
      router.push('/match/create')
    }
  } else {
    router.push('/match/create')
  }
}

onMounted(() => {
  const savedMatch = localStorage.getItem('ptcg_bp_current_match')
  if (savedMatch) {
    currentMatch.value = JSON.parse(savedMatch)
  }
})
</script>

<style scoped>
.team-bp {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.create-btn {
  width: 100%;
  padding: 1.5rem;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.create-btn:hover {
  background: #27ae60;
}

.current-match {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.match-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.continue-btn {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.continue-btn:hover {
  background: #2980b9;
}

@media (max-width: 768px) {
  .current-match {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .continue-btn {
    width: 100%;
  }
}
</style> 