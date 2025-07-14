#!/usr/bin/env node

/**
 * Technical Debt Manager
 * 
 * A command-line tool to manage the technical debt tracker.
 * Helps add new debt items, update status, and generate reports.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DEBT_FILE = path.join(__dirname, '..', 'TECHNICAL_DEBT.md');

class TechnicalDebtManager {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Main menu
   */
  async showMenu() {
    console.log('\n🔧 Technical Debt Manager');
    console.log('========================');
    console.log('1. Add new debt item');
    console.log('2. Update debt status');
    console.log('3. Generate report');
    console.log('4. List all debt items');
    console.log('5. Calculate metrics');
    console.log('6. Exit');
    
    const choice = await this.question('\nSelect an option (1-6): ');
    
    switch (choice) {
      case '1':
        await this.addDebtItem();
        break;
      case '2':
        await this.updateDebtStatus();
        break;
      case '3':
        await this.generateReport();
        break;
      case '4':
        await this.listDebtItems();
        break;
      case '5':
        await this.calculateMetrics();
        break;
      case '6':
        console.log('Goodbye! 👋');
        this.rl.close();
        return;
      default:
        console.log('Invalid option. Please try again.');
        await this.showMenu();
    }
  }

  /**
   * Add a new debt item
   */
  async addDebtItem() {
    console.log('\n📝 Adding New Debt Item');
    console.log('=======================');

    const id = await this.question('ID (e.g., FE-010): ');
    const title = await this.question('Title: ');
    const description = await this.question('Description: ');
    
    console.log('\nImpact Level:');
    console.log('1. High - Blocks features, causes bugs, security issues');
    console.log('2. Medium - Slows development, poor UX');
    console.log('3. Low - Code quality, maintainability');
    const impactChoice = await this.question('Select impact (1-3): ');
    const impact = ['High', 'Medium', 'Low'][parseInt(impactChoice) - 1];

    console.log('\nEffort Level:');
    console.log('1. Low - <1 day');
    console.log('2. Medium - 1-2 days');
    console.log('3. High - 2+ days');
    const effortChoice = await this.question('Select effort (1-3): ');
    const effort = ['Low', 'Medium', 'High'][parseInt(effortChoice) - 1];

    const effortDays = await this.question('Estimated days: ');
    const category = await this.question('Category (Frontend/Backend/Infrastructure): ');

    const newItem = {
      id,
      title,
      description,
      impact,
      effort,
      effortDays: parseInt(effortDays),
      category,
      created: new Date().toISOString().split('T')[0],
      status: 'Open'
    };

    await this.addItemToFile(newItem);
    console.log(`\n✅ Added debt item: ${id}`);
    await this.showMenu();
  }

  /**
   * Update debt status
   */
  async updateDebtStatus() {
    console.log('\n🔄 Update Debt Status');
    console.log('====================');

    const debtItems = await this.getDebtItems();
    if (debtItems.length === 0) {
      console.log('No debt items found.');
      await this.showMenu();
      return;
    }

    console.log('\nAvailable items:');
    debtItems.forEach(item => {
      console.log(`${item.id}: ${item.title} (${item.status})`);
    });

    const itemId = await this.question('\nEnter item ID to update: ');
    const item = debtItems.find(i => i.id === itemId);
    
    if (!item) {
      console.log('Item not found.');
      await this.showMenu();
      return;
    }

    console.log('\nStatus Options:');
    console.log('1. Open');
    console.log('2. In Progress');
    console.log('3. Review');
    console.log('4. Resolved');
    console.log('5. Deferred');
    
    const statusChoice = await this.question('Select new status (1-5): ');
    const statuses = ['Open', 'In Progress', 'Review', 'Resolved', 'Deferred'];
    const newStatus = statuses[parseInt(statusChoice) - 1];

    await this.updateItemStatus(itemId, newStatus);
    console.log(`\n✅ Updated ${itemId} status to: ${newStatus}`);
    await this.showMenu();
  }

  /**
   * Generate a report
   */
  async generateReport() {
    console.log('\n📊 Technical Debt Report');
    console.log('========================');

    const debtItems = await this.getDebtItems();
    const metrics = this.calculateMetricsFromItems(debtItems);

    console.log(`\n📈 Summary:`);
    console.log(`Total Items: ${metrics.totalItems}`);
    console.log(`Open Items: ${metrics.openItems}`);
    console.log(`In Progress: ${metrics.inProgress}`);
    console.log(`Resolved: ${metrics.resolved}`);
    console.log(`Total Effort: ${metrics.totalEffort} days`);

    console.log(`\n🎯 By Priority:`);
    console.log(`High Priority: ${metrics.highPriority} items`);
    console.log(`Medium Priority: ${metrics.mediumPriority} items`);
    console.log(`Low Priority: ${metrics.lowPriority} items`);

    console.log(`\n📂 By Category:`);
    Object.entries(metrics.byCategory).forEach(([category, count]) => {
      console.log(`${category}: ${count} items`);
    });

    if (metrics.openItems > 0) {
      console.log(`\n🔴 High Priority Open Items:`);
      debtItems
        .filter(item => item.status === 'Open' && item.impact === 'High')
        .forEach(item => {
          console.log(`- ${item.id}: ${item.title} (${item.effortDays} days)`);
        });
    }

    await this.showMenu();
  }

  /**
   * List all debt items
   */
  async listDebtItems() {
    console.log('\n📋 All Debt Items');
    console.log('=================');

    const debtItems = await this.getDebtItems();
    
    if (debtItems.length === 0) {
      console.log('No debt items found.');
      await this.showMenu();
      return;
    }

    debtItems.forEach(item => {
      const priority = item.impact === 'High' ? '🔴' : item.impact === 'Medium' ? '🟡' : '🟢';
      console.log(`${priority} ${item.id}: ${item.title}`);
      console.log(`   Status: ${item.status} | Impact: ${item.impact} | Effort: ${item.effortDays} days`);
      console.log(`   Category: ${item.category} | Created: ${item.created}`);
      console.log(`   Description: ${item.description}`);
      console.log('');
    });

    await this.showMenu();
  }

  /**
   * Calculate metrics
   */
  async calculateMetrics() {
    console.log('\n🧮 Calculating Metrics');
    console.log('=====================');

    const debtItems = await this.getDebtItems();
    const metrics = this.calculateMetricsFromItems(debtItems);

    console.log(`\n📊 Metrics Summary:`);
    console.log(`Total Debt Items: ${metrics.totalItems}`);
    console.log(`Open Items: ${metrics.openItems}`);
    console.log(`Resolved Items: ${metrics.resolved}`);
    console.log(`Resolution Rate: ${metrics.resolutionRate}%`);
    console.log(`Total Effort Required: ${metrics.totalEffort} days`);
    console.log(`Average Effort per Item: ${metrics.avgEffort} days`);

    console.log(`\n🎯 Priority Distribution:`);
    console.log(`High Priority: ${metrics.highPriority} (${metrics.highPriorityPercent}%)`);
    console.log(`Medium Priority: ${metrics.mediumPriority} (${metrics.mediumPriorityPercent}%)`);
    console.log(`Low Priority: ${metrics.lowPriority} (${metrics.lowPriorityPercent}%)`);

    await this.showMenu();
  }

  /**
   * Helper methods
   */
  question(prompt) {
    return new Promise(resolve => {
      this.rl.question(prompt, resolve);
    });
  }

  async getDebtItems() {
    // This is a simplified version - in a real implementation,
    // you'd parse the markdown file and extract the table data
    return [];
  }

  calculateMetricsFromItems(items) {
    const totalItems = items.length;
    const openItems = items.filter(item => item.status === 'Open').length;
    const inProgress = items.filter(item => item.status === 'In Progress').length;
    const resolved = items.filter(item => item.status === 'Resolved').length;
    const totalEffort = items.reduce((sum, item) => sum + item.effortDays, 0);
    
    const highPriority = items.filter(item => item.impact === 'High').length;
    const mediumPriority = items.filter(item => item.impact === 'Medium').length;
    const lowPriority = items.filter(item => item.impact === 'Low').length;

    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalItems,
      openItems,
      inProgress,
      resolved,
      totalEffort,
      avgEffort: totalItems > 0 ? (totalEffort / totalItems).toFixed(1) : 0,
      resolutionRate: totalItems > 0 ? Math.round((resolved / totalItems) * 100) : 0,
      highPriority,
      mediumPriority,
      lowPriority,
      highPriorityPercent: totalItems > 0 ? Math.round((highPriority / totalItems) * 100) : 0,
      mediumPriorityPercent: totalItems > 0 ? Math.round((mediumPriority / totalItems) * 100) : 0,
      lowPriorityPercent: totalItems > 0 ? Math.round((lowPriority / totalItems) * 100) : 0,
      byCategory
    };
  }

  async addItemToFile(item) {
    // In a real implementation, you'd parse the markdown file,
    // add the item to the appropriate table, and write it back
    console.log('Would add item to file:', item);
  }

  async updateItemStatus(itemId, newStatus) {
    // In a real implementation, you'd update the status in the markdown file
    console.log(`Would update ${itemId} status to ${newStatus}`);
  }
}

// Run the manager
if (require.main === module) {
  const manager = new TechnicalDebtManager();
  manager.showMenu().catch(console.error);
}

module.exports = TechnicalDebtManager; 