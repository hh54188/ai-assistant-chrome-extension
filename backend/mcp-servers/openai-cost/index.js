import dayjs from 'dayjs';
import { config } from '../../config.js';

const OPENAI_API_KEY = config.openai.apiKey;

async function getOpenAICosts(startTime) {
    try {
        const url = new URL('https://api.openai.com/v1/organization/costs');
        url.searchParams.append('start_time', startTime);
        url.searchParams.append('limit', 32);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching OpenAI costs:', error.message);
        throw error;
    }
}

export async function getMonthlyOpenAICost() {
    const startTime = dayjs().startOf('month').unix();
    let costsData = await getOpenAICosts(startTime);
    if (costsData.data && costsData.data.length > 0) {
        const totalAmount = costsData.data
            .filter(item => item.results && item.results.length > 0)
            .reduce((total, item) => {
                const itemTotal = item.results.reduce((sum, result) => {
                    return sum + (result.amount?.value || 0);
                }, 0);
                return total + itemTotal;
            }, 0);

        return totalAmount.toFixed(2);
    }
    return 0;
}

// MCP tool function for getting OpenAI costs
export async function getOpenAICostsTool(params) {
    try {
        const { period = 'month' } = params;
        
        let startTime;
        if (period === 'month') {
            startTime = dayjs().startOf('month').unix();
        } else if (period === 'week') {
            startTime = dayjs().startOf('week').unix();
        } else if (period === 'year') {
            startTime = dayjs().startOf('year').unix();
        } else {
            throw new Error('Invalid period. Use "week", "month", or "year"');
        }

        let costsData = await getOpenAICosts(startTime);
        if (costsData.data && costsData.data.length > 0) {
            const totalAmount = costsData.data
                .filter(item => item.results && item.results.length > 0)
                .reduce((total, item) => {
                    const itemTotal = item.results.reduce((sum, result) => {
                        return sum + (result.amount?.value || 0);
                    }, 0);
                    return total + itemTotal;
                }, 0);

            return  `Total OpenAI costs for ${period}: $${totalAmount.toFixed(2)}`
        }
        
        return `No costs found for ${period}`
    } catch (error) {
        return `Failed to fetch OpenAI costs: ${error.message}`
    }
}
