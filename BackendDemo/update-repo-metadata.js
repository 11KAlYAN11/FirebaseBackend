#!/usr/bin/env node
/**
 * GitHub Repository Metadata Updater
 * Updates repository description, topics, website, and homepage using GitHub REST API
 * 
 * Usage:
 *   node update-repo-metadata.js
 * 
 * Environment Variables Required:
 *   GITHUB_TOKEN - Your GitHub Personal Access Token
 *   GITHUB_OWNER - Repository owner (username or org)
 *   GITHUB_REPO - Repository name
 */

const https = require('https');

// Configuration - Update these values
const CONFIG = {
    owner: process.env.GITHUB_OWNER || '11KAlYAN11',
    repo: process.env.GITHUB_REPO || 'FirebaseBackend',
    token: process.env.GITHUB_TOKEN,
    
    // Repository metadata to update
    metadata: {
        description: 'A production-ready Firebase To-Do List MVP with multi-provider authentication, real-time sync, and modern UI',
        homepage: 'https://firebase.google.com/',
        website: 'https://firebase.google.com/',
        topics: [
            'firebase',
            'todo-app',
            'javascript',
            'firestore',
            'authentication',
            'real-time',
            'mvp',
            'web-app',
            'firebase-hosting',
            'firebase-auth'
        ],
        has_issues: true,
        has_projects: true,
        has_wiki: true,
        has_downloads: true,
        is_private: false
    }
};

/**
 * Make GitHub API request
 */
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: path,
            method: method,
            headers: {
                'Authorization': `token ${CONFIG.token}`,
                'User-Agent': 'GitHub-Repo-Metadata-Updater',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`API Error: ${res.statusCode} - ${parsed.message || body}`));
                    }
                } catch (e) {
                    reject(new Error(`Parse Error: ${e.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Update repository metadata
 */
async function updateRepositoryMetadata() {
    if (!CONFIG.token) {
        console.error('❌ Error: GITHUB_TOKEN environment variable is required');
        console.log('\n📝 How to get a GitHub token:');
        console.log('   1. Go to https://github.com/settings/tokens');
        console.log('   2. Click "Generate new token (classic)"');
        console.log('   3. Select scopes: repo (full control)');
        console.log('   4. Copy the token and set: export GITHUB_TOKEN=your_token');
        process.exit(1);
    }

    console.log(`🚀 Updating metadata for ${CONFIG.owner}/${CONFIG.repo}...\n`);

    try {
        // Step 1: Update repository basic info
        console.log('📝 Step 1: Updating repository description and settings...');
        const updatePath = `/repos/${CONFIG.owner}/${CONFIG.repo}`;
        const updateData = {
            description: CONFIG.metadata.description,
            homepage: CONFIG.metadata.homepage,
            has_issues: CONFIG.metadata.has_issues,
            has_projects: CONFIG.metadata.has_projects,
            has_wiki: CONFIG.metadata.has_wiki,
            has_downloads: CONFIG.metadata.has_downloads,
            is_private: CONFIG.metadata.is_private
        };

        const repoResult = await makeRequest('PATCH', updatePath, updateData);
        console.log('✅ Repository info updated successfully!');
        console.log(`   Description: ${repoResult.description}`);
        console.log(`   Homepage: ${repoResult.homepage || 'Not set'}\n`);

        // Step 2: Update repository topics
        console.log('🏷️  Step 2: Updating repository topics...');
        const topicsPath = `/repos/${CONFIG.owner}/${CONFIG.repo}/topics`;
        const topicsData = {
            names: CONFIG.metadata.topics
        };

        const topicsResult = await makeRequest('PUT', topicsPath, topicsData);
        console.log('✅ Topics updated successfully!');
        console.log(`   Topics: ${topicsResult.names.join(', ')}\n`);

        console.log('🎉 All metadata updated successfully!');
        console.log(`\n🔗 View your repository: https://github.com/${CONFIG.owner}/${CONFIG.repo}`);

    } catch (error) {
        console.error('❌ Error updating repository:', error.message);
        process.exit(1);
    }
}

// Run the updater
updateRepositoryMetadata();

