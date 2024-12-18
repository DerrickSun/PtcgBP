<template>
  <div class="home">
    <section class="hero">
      <h1>欢迎来到 PtcgBP</h1>
      <p>您的宝可梦卡牌游戏助手</p>
    </section>

    <section class="features">
      <div class="feature-card">
        <h3>卡牌数据库</h3>
        <p>查询和浏览最新的卡牌信息</p>
        <router-link to="/cards" class="btn">浏览卡牌</router-link>
      </div>

      <div class="feature-card">
        <h3>卡组构筑</h3>
        <p>创建和分享您的卡组</p>
        <router-link to="/decks" class="btn">开始构筑</router-link>
      </div>

      <div class="feature-card">
        <h3>对战策略</h3>
        <p>学习和讨论对战技巧</p>
        <router-link to="/strategy" class="btn">查看攻略</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #666;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.feature-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn:hover {
  background-color: #2980b9;
}
</style> 