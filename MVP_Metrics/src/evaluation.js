// src/evaluation.js
import metricData from './metricExamples.json';

// Helper function to round numbers
const round = (num, decimals = 1) => {
    if (typeof num !== 'number') return num;
    return Number(num.toFixed(decimals));
};

// Helper to get developer data
const getDeveloperData = (developer_id, month) => {
    return metricData.find(
        item => item.developer_id === developer_id && item.month === month
    );
};

// Generate insights based on metrics (with rounded values for display)
const generateInsights = (data) => {
    const insights = [];
    const nextSteps = [];
    
    // Round metrics for display in insights
    const leadTime = round(data.avg_lead_time_days);
    const cycleTime = round(data.avg_cycle_time_days);
    const bugRate = round(data.bug_rate_pct);
    
    // Lead time analysis
    if (leadTime > 5) {
        insights.push(`Lead time of ${leadTime} days is higher than ideal (>5 days). The total time to reach production is slower than ideal.`);
        nextSteps.push("Investigate bottlenecks in the deployment pipeline");
    } else if (leadTime > 3) {
        insights.push(`Lead time of ${leadTime} days is moderate. Consider optimizing code review and deployment processes.`);
        nextSteps.push("Map out the end-to-end delivery process to identify delays");
    } else {
        insights.push(`Lead time of ${leadTime} days is good! Fast time to production.`);
    }
    
    // Cycle time analysis
    if (cycleTime > 4) {
        insights.push(`Cycle time of ${cycleTime} days indicates development is taking longer than expected.`);
        nextSteps.push("Reduce PR size or ticket scope so feedback arrives faster");
    } else if (cycleTime > 2.5) {
        insights.push(`Cycle time of ${cycleTime} days is acceptable but could be improved.`);
        nextSteps.push("Separate review delay from deployment delay before prescribing a fix");
    } else {
        insights.push(`Cycle time of ${cycleTime} days is excellent! Fast development cycle.`);
    }
    
    // PR throughput analysis
    if (data.merged_prs < 2) {
        insights.push(`Only ${data.merged_prs} PR(s) merged - low throughput. Might indicate complex work or bottlenecks.`);
        nextSteps.push("Break down work into smaller, more frequent PRs");
    } else if (data.merged_prs === 2) {
        insights.push(`${data.merged_prs} PRs merged - average throughput. Consistent delivery.`);
        nextSteps.push("Maintain current pace while improving quality metrics");
    } else {
        insights.push(`${data.merged_prs} PRs merged - good throughput! High velocity.`);
    }
    
    // Deployment frequency analysis
    if (data.prod_deployments < 2) {
        insights.push(`Only ${data.prod_deployments} production deployment(s) - infrequent releases.`);
        nextSteps.push("Aim for more frequent, smaller deployments");
    } else if (data.prod_deployments === 2) {
        insights.push(`${data.prod_deployments} production deployments - regular release cadence.`);
        nextSteps.push("Consider moving to continuous deployment if quality allows");
    } else {
        insights.push(`${data.prod_deployments} production deployments - excellent deployment frequency!`);
    }
    
    // Bug rate analysis
    if (bugRate > 30) {
        insights.push(`Bug rate of ${bugRate}% is concerning. Quality issues affecting production.`);
        nextSteps.push("Add one quality safeguard if the bug rate rises - consider automated testing or code review enhancements");
    } else if (bugRate > 10) {
        insights.push(`Bug rate of ${bugRate}% is moderate. Some quality improvements needed.`);
        nextSteps.push("Implement automated testing for critical paths");
    } else {
        insights.push(`Bug rate of ${bugRate}% is excellent! High quality deliveries.`);
    }
    
    // Pattern hint interpretation
    const patternInterpretations = {
        'Healthy flow': '✅ Great! All metrics are in good balance. Keep maintaining this flow.',
        'Quality watch': '⚠️ Bug rate is elevated. Focus on testing and code quality improvements.',
        'Needs review': '📊 Multiple metrics need attention. Consider process improvements.',
        'Bottleneck': '🚦 Delivery is blocked or slowed. Identify and remove constraints.'
    };
    
    insights.push(patternInterpretations[data.pattern_hint] || `Pattern: ${data.pattern_hint}`);
    
    return { insights, nextSteps };
};

// Main evaluation function - ALL metrics rounded here
export const evaluateDeveloper = async (developer_id, month) => {
    const developerData = getDeveloperData(developer_id, month);
    
    if (!developerData) {
        return {
            error: true,
            message: `No data found for ${developer_id} in ${month}`
        };
    }
    
    const { insights, nextSteps } = generateInsights(developerData);
    
    const evaluationResult = {
        selected_developer: developer_id,
        selected_month: month,
        developer_name: developerData.developer_name,
        team: developerData.team_name,
        
        // ALL METRICS ROUNDED HERE
        metrics: {
            lead_time_days: round(developerData.avg_lead_time_days, 1),
            cycle_time_days: round(developerData.avg_cycle_time_days, 1),
            pr_throughput: developerData.merged_prs,
            deployment_frequency: developerData.prod_deployments,
            bug_rate_percent: round(developerData.bug_rate_pct, 1),
            issues_done: developerData.issues_done,
            escaped_bugs: developerData.escaped_bugs,
            pattern_hint: developerData.pattern_hint
        },
        
        interpretation: insights,
        next_steps: nextSteps,
        summary: `${developerData.developer_name} from ${developerData.team_name} has ${insights[0].toLowerCase()} ${nextSteps.length > 0 ? 'Key improvement areas: ' + nextSteps.slice(0, 3).join('. ') : ''}`,
        raw_data: developerData,
        timestamp: new Date().toISOString()
    };
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(evaluationResult);
        }, 500);
    });
};

// Batch evaluation for multiple developers
export const evaluateTeam = async (team_name, month) => {
    const teamMembers = metricData.filter(
        item => item.team_name === team_name && item.month === month
    );
    
    const evaluations = await Promise.all(
        teamMembers.map(member => evaluateDeveloper(member.developer_id, month))
    );
    
    return {
        team: team_name,
        month: month,
        member_count: teamMembers.length,
        evaluations: evaluations,
        team_summary: {
            avg_lead_time: round(teamMembers.reduce((sum, m) => sum + m.avg_lead_time_days, 0) / teamMembers.length, 1),
            avg_cycle_time: round(teamMembers.reduce((sum, m) => sum + m.avg_cycle_time_days, 0) / teamMembers.length, 1),
            total_prs: teamMembers.reduce((sum, m) => sum + m.merged_prs, 0),
            avg_bug_rate: round(teamMembers.reduce((sum, m) => sum + m.bug_rate_pct, 0) / teamMembers.length, 1)
        }
    };
};

// Compare two periods for the same developer - ROUNDED
export const comparePeriods = async (developer_id, month1, month2) => {
    const data1 = getDeveloperData(developer_id, month1);
    const data2 = getDeveloperData(developer_id, month2);
    
    if (!data1 || !data2) {
        return { error: true, message: "Data not found for one or both periods" };
    }
    
    return {
        developer: developer_id,
        name: data1.developer_name,
        period1: {
            month: month1,
            lead_time: round(data1.avg_lead_time_days, 1),
            cycle_time: round(data1.avg_cycle_time_days, 1),
            prs: data1.merged_prs,
            bug_rate: round(data1.bug_rate_pct, 1)
        },
        period2: {
            month: month2,
            lead_time: round(data2.avg_lead_time_days, 1),
            cycle_time: round(data2.avg_cycle_time_days, 1),
            prs: data2.merged_prs,
            bug_rate: round(data2.bug_rate_pct, 1)
        },
        changes: {
            lead_time_change: round(data2.avg_lead_time_days - data1.avg_lead_time_days, 1),
            cycle_time_change: round(data2.avg_cycle_time_days - data1.avg_cycle_time_days, 1),
            pr_change: data2.merged_prs - data1.merged_prs,
            bug_rate_change: round(data2.bug_rate_pct - data1.bug_rate_pct, 1)
        }
    };
};