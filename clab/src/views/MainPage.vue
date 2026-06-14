<template>
    <div class="main-page">
        <main class="main-content">
            <!-- 히어로 섹션 -->
            <section class="hero">
                <div class="hero-text">
                    <span class="badge">🦀 채팅 분석 연구소</span>
                    <h1 class="hero-title">
                        채팅의 숨겨진 바이브를<br />집어내다!
                        <span class="highlight">꽃게 연구소(CLab)</span>
                    </h1>
                    <p class="hero-desc">
                        대화를 업로드하고 누가 이겼는지, 내 캐릭터는 무엇인지<br />
                        귀엽게 분석해보세요.
                    </p>

                    <div class="hero-buttons">
                        <button class="upload-btn" @click="goAnalyze">🦀 대화 업로드하기</button>
                        <button class="sample-btn">샘플 보기</button>
                    </div>
                </div>

                <div class="hero-image">
                    <div class="crab-circle">
                        <img src="../assets/imgs/AB6AXU_1.PNG"/>
                    </div>
                </div>
            </section>

            <!-- 메인 분석 버튼 (가운데 크게) -->
            <section class="analyze-section">
                <button class="analyze-btn" @click="goAnalyze">
                    <span class="analyze-icon">🦀</span>
                    대화 내용 분석하기
                </button>
                <p class="analyze-hint">대화 파일을 업로드하고 분석을 시작하세요!</p>
            </section>

            <!-- 4가지 기능 소개 -->
            <section class="features">
                <h2 class="features-title">연구소 주요 실험실</h2>
                <p class="features-subtitle">어떤 게임을 분석해볼까요?</p>

                <div class="feature-grid">
                    <div class="feature-card" v-for="feature in features" :key="feature.id">
                        <div class="feature-icon" :style="{ background: feature.color }">
                            {{ feature.emoji }}
                        </div>
                        <h3 class="feature-name">{{ feature.name }}</h3>
                        <p class="feature-desc">{{ feature.desc }}</p>
                        <a href="#" class="feature-link">분석 시작하기 →</a>
                    </div>
                </div>
            </section>
        </main>

    </div>
</template>

<script setup>
import { ref } from 'vue'

const goAnalyze = () => {
    // 분석 페이지 라우트 추가 시 연결
    console.log('대화 분석 시작!')
}

const features = ref([
    {
        id: 1,
        emoji: '⚔️',
        color: '#e8554e',
        name: '말싸움 분석',
        desc: '논쟁이 있었나요? 대화의 흐름을 분석해 진짜로 누가 이겼는지 승자를 판별해드립니다.',
    },
    {
        id: 2,
        emoji: '💧',
        color: '#5bb4c4',
        name: '화해 멘트 생성',
        desc: '어색해진 사이, 관계를 다시 따뜻하게 만들어줄 화해 멘트를 추천해드립니다.',
    },
    {
        id: 3,
        emoji: '🎭',
        color: '#e6b800',
        name: '말투 성향 분석',
        desc: '대화 말투가 다정/투덜이? 당신의 대화 성향을 분석해서 캐릭터로 알려드립니다.',
    },
    {
        id: 4,
        emoji: '📋',
        color: '#e8a3b8',
        name: '회의 내용 요약',
        desc: '길어진 단체방 회의, 핵심만 깔끔하게 요약하고 주요 결정 사항까지 정리해드립니다.',
    },
])
</script>

<style scoped>
.main-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--sand-light);
}

.main-content {
    flex: 1;
}

/* 히어로 */
.hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 60px 80px;
    background: linear-gradient(160deg, #cdeaef 0%, #f5ecd9 70%);
    gap: 40px;
}

.hero-text {
    max-width: 540px;
}

.badge {
    display: inline-block;
    background: var(--sky-blue);
    color: var(--white);
    font-size: 12px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 18px;
}

.hero-title {
    font-size: 38px;
    font-weight: 800;
    color: var(--text-dark);
    line-height: 1.3;
}

.highlight {
    color: var(--crab-red);
}

.hero-desc {
    color: var(--text-gray);
    font-size: 15px;
    line-height: 1.7;
    margin: 18px 0 28px;
}

.hero-buttons {
    display: flex;
    gap: 14px;
}

.upload-btn {
    background: var(--crab-red);
    color: var(--white);
    border: none;
    border-radius: 24px;
    padding: 14px 26px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s;
}

.upload-btn:hover {
    transform: scale(1.03);
}

.sample-btn {
    background: var(--white);
    color: var(--text-dark);
    border: 1.5px solid var(--sand-dark);
    border-radius: 24px;
    padding: 14px 26px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
}

.hero-image {
    flex-shrink: 0;
}

.crab-circle {
    width: 180px;
    height: 180px;
    background: #2b2b3a;
    border-radius: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.big-crab {
    font-size: 70px;
}

.speech-bubble {
    position: absolute;
    top: 30px;
    right: 24px;
    background: var(--white);
    color: var(--text-dark);
    font-size: 13px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 12px;
}

/* 메인 분석 버튼 */
.analyze-section {
    text-align: center;
    padding: 50px 20px;
}

.analyze-btn {
    background: var(--crab-red);
    color: var(--white);
    border: none;
    border-radius: 40px;
    padding: 22px 60px;
    font-size: 22px;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(196, 30, 58, 0.3);
    transition: transform 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 12px;
}

.analyze-btn:hover {
    transform: scale(1.05);
}

.analyze-icon {
    font-size: 26px;
}

.analyze-hint {
    color: var(--text-gray);
    font-size: 14px;
    margin-top: 16px;
}

/* 기능 소개 */
.features {
    padding: 50px 80px 70px;
    border-top: 2px dashed var(--sky-blue);
}

.features-title {
    text-align: center;
    font-size: 24px;
    font-weight: 800;
    color: var(--text-dark);
}

.features-subtitle {
    text-align: center;
    color: var(--text-gray);
    font-size: 14px;
    margin: 8px 0 36px;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
}

.feature-card {
    background: var(--white);
    border-radius: 16px;
    padding: 28px 22px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s;
}

.feature-card:hover {
    transform: translateY(-6px);
}

.feature-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 16px;
}

.feature-name {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 10px;
}

.feature-desc {
    font-size: 13px;
    color: var(--text-gray);
    line-height: 1.6;
    margin-bottom: 16px;
    min-height: 62px;
}

.feature-link {
    color: var(--crab-red);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
}

@media (max-width: 900px) {
    .feature-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .hero {
        flex-direction: column;
        text-align: center;
        padding: 40px 30px;
    }
}
</style>
