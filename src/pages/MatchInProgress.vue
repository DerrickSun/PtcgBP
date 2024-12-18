<template>
  <div class="match-in-progress">
    <div class="bp-card">
      <div class="match-header">
        <h3>{{ matchName || '比赛' }} - Round {{ currentRound }}</h3>
        <button class="edit-btn" @click="$emit('editMyDecks')">编辑我方卡组</button>
      </div>

      <div class="opponent-selection">
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
    </div>
  </div>
</template> 