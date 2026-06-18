<template>
    <div class="radar-wrapper">
        <canvas ref="radarChartRef"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// 부모 컴포넌트로부터 받을 데이터 정의
const props = defineProps({
    participantName: {
        type: String,
        default: '참여자'
    },
    labels: {
        type: Array,
        required: true
    },
    chartData: {
        type: Array,
        required: true
    },
    colors: {
        type: Array,
        required: true
    }
})

const radarChartRef = ref(null)
let radarChartInstance = null

const renderChart = () => {
    if (!radarChartRef.value) return

    // 기존 차트가 있으면 삭제 (중복 렌더링 방지)
    if (radarChartInstance) {
        radarChartInstance.destroy()
    }

    radarChartInstance = new Chart(radarChartRef.value, {
        type: 'radar',
        data: {
            labels: props.labels,
            datasets: [
                {
                    label: props.participantName,
                    data: props.chartData,
                    backgroundColor: 'rgba(91, 180, 196, 0.25)',
                    borderColor: '#5bb4c4',
                    borderWidth: 2,
                    pointBackgroundColor: props.colors,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#3a3a3a',
                    titleColor: '#fdf6e8',
                    bodyColor: '#fdf6e8',
                    callbacks: {
                        label: ctx => ` ${ctx.raw}회`,
                    },
                },
            },
            scales: {
                r: {
                    beginAtZero: true,
                    grid: { color: '#f0d9a860' },
                    angleLines: { color: '#f0d9a860' },
                    ticks: {
                        display: false,
                        stepSize: 1,
                    },
                    pointLabels: {
                        color: '#3a3a3a',
                        font: { size: 13, weight: '600' },
                    },
                },
            },
        },
    })
}

// 컴포넌트가 마운트될 때 차트 그리기
onMounted(() => {
    renderChart()
})

// 부모로부터 받은 데이터가 변경되면 차트 다시 그리기 (반응형 대응)
watch(
    () => [props.labels, props.chartData, props.colors],
    () => {
        renderChart()
    },
    { deep: true }
)
</script>