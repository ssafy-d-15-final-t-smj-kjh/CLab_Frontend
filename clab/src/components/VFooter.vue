<template>
    <footer class="app-footer">
        <div class="footer-content">
            <div class="footer-logo">
                <span class="crab-emoji">🦀</span>
                <span class="footer-title">꽃게 연구소 (CLab)</span>
            </div>
            <p class="footer-desc">채팅의 숨겨진 바이브를 집어내다!</p>
            <div class="footer-links">
                <a href="#">이용약관</a>
                <span>·</span>
                <a href="#">개인정보처리방침</a>
                <span>·</span>
                <a href="#">고객센터</a>
            </div>
            <p class="footer-copy">© 2026 CLab. All rights reserved.</p>
        </div>
    </footer>
</template>

<script setup>
// Footer는 정적 컴포넌트라 별도 로직 없음
</script>

<style scoped>
.app-footer {
    background: var(--sand-dark);
    padding: 30px 40px;
    margin-top: auto;
}

.footer-content {
    max-width: 1000px;
    margin: 0 auto;
    text-align: center;
    color: var(--black);
}

.footer-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;
}

.crab-emoji {
    font-size: 22px;
}

.footer-title {
    font-size: 18px;
    font-weight: 700;
}

.footer-desc {
    font-size: 13px;
    opacity: 0.9;
    margin-bottom: 14px;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 13px;
}

.footer-links a {
    color: var(--white);
    text-decoration: none;
}

.footer-links a:hover {
    text-decoration: underline;
}

.footer-copy {
    font-size: 12px;
    opacity: 0.8;
}
</style>
