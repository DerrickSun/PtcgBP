<template>
  <div id="app">
    <header class="header">
      <h1>宝可梦卡牌团队赛BP助手</h1>
      <nav>
        <router-link to="/match">比赛</router-link>
        <router-link to="/match/history">历史记录</router-link>
      </nav>
    </header>
    <main class="main-content">
      <router-view></router-view>
    </main>
    <footer class="footer">
      <p>© 2024 PtcgBP. All rights reserved.</p>
    </footer>
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

nav {
  margin-top: 1rem;
}

nav a {
  color: white;
  text-decoration: none;
  margin-right: 1rem;
  padding: 0.5rem;
}

nav a:hover {
  background-color: #34495e;
  border-radius: 4px;
}

.router-link-active {
  background-color: #34495e;
  border-radius: 4px;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}
</style> 