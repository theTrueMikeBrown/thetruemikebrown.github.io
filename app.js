const { createApp } = Vue;

// Event Tree Component (recursive)
const EventTree = {
  name: 'EventTree',
  props: ['event', 'blueprints', 'level'],
  emits: ['showWeapon', 'showCrew', 'showAugment', 'showDrone', 'showShip'],
  data() {
    return {
      collapsed: this.level > 0 // Auto-expand first level, collapse nested
    };
  },
  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed;
    },
    hasNestedContent(event) {
      return (event.events && event.events.length > 0) ||
             (event.Events && event.Events.length > 0) ||
             (event.Ships && event.Ships.length > 0) ||
             (event.weapons && event.weapons.length > 0) ||
             (event.crew && event.crew.length > 0) ||
             (event.augments && event.augments.length > 0) ||
             (event.drones && event.drones.length > 0) ||
             (event.quests && event.quests.length > 0);
    },
    getIndentClass() {
      return `event-level-${Math.min(this.level, 5)}`;
    },
    showWeaponDetails(weaponName) {
      this.$emit('showWeapon', weaponName);
    },
    showCrewDetails(crewName) {
      this.$emit('showCrew', crewName);
    },
    showAugmentDetails(augmentName) {
      this.$emit('showAugment', augmentName);
    },
    showDroneDetailsLocal(droneName) {
      this.$emit('showDrone', droneName);
    },
    showShipDetails(shipName) {
      this.$emit('showShip', shipName);
    }
  },
  template: `
    <div class="event-node" :class="getIndentClass()">
      <div class="event-header" :class="{ collapsed: collapsed, hasChildren: hasNestedContent(event), isFiltered: (event.text || event.Text || '').includes('[System event - removed for brevity]') }">
        <span class="collapse-icon" v-if="hasNestedContent(event)" @click="toggleCollapse">{{ collapsed ? '▶' : '▼' }}</span>
        <span class="collapse-icon placeholder" v-else></span>
        <span class="event-id" :class="{ 'clickable-ship': event.isShip }" @click.stop="event.isShip ? showShipDetails(event.AutoBlueprint || event.Name) : toggleCollapse()">{{ event.id || event.Name }}</span>
        <span v-if="event.text || event.Text" class="event-text-preview" @click="toggleCollapse">{{ (event.text || event.Text).substring(0, 100) }}{{ (event.text || event.Text).length > 100 ? '...' : '' }}</span>
      </div>
      
      <div v-if="!collapsed" class="event-content">
        <div v-if="event.text || event.Text" class="event-text-full">
          {{ event.text || event.Text }}
        </div>
        
        <!-- Nested Events (lowercase) -->
        <div v-if="event.events && event.events.length > 0" class="event-children">
          <div class="event-section-title">Choices/Events:</div>
          <event-tree 
            v-for="(childEvent, index) in event.events" 
            :key="(childEvent.id || childEvent.Name) + '-' + index" 
            :event="childEvent"
            :blueprints="blueprints"
            :level="level + 1"
            @showWeapon="$emit('showWeapon', $event)"
            @showCrew="$emit('showCrew', $event)"
            @showAugment="$emit('showAugment', $event)"
            @showDrone="$emit('showDrone', $event)"
            @showShip="$emit('showShip', $event)">
          </event-tree>
        </div>
        
        <!-- Nested Events (uppercase) -->
        <div v-if="event.Events && event.Events.length > 0" class="event-children">
          <div class="event-section-title">Choices/Events:</div>
          <event-tree 
            v-for="(childEvent, index) in event.Events" 
            :key="(childEvent.id || childEvent.Name) + '-' + index" 
            :event="childEvent"
            :blueprints="blueprints"
            :level="level + 1"
            @showWeapon="$emit('showWeapon', $event)"
            @showCrew="$emit('showCrew', $event)"
            @showAugment="$emit('showAugment', $event)"
            @showDrone="$emit('showDrone', $event)"
            @showShip="$emit('showShip', $event)">
          </event-tree>
        </div>
        
        <!-- Ships -->
        <div v-if="event.Ships && event.Ships.length > 0" class="event-children">
          <div class="event-section-title">Ships:</div>
          <div v-for="(ship, index) in event.Ships" :key="'ship-' + ship.Name + '-' + index">
            <event-tree 
              :event="{ id: ship.Name, Name: ship.Name, AutoBlueprint: ship.AutoBlueprint, text: ship.AutoBlueprint ? 'Auto Blueprint: ' + ship.AutoBlueprint : '', Events: ship.Events, weapons: ship.Weapons, crew: ship.Crew, augments: ship.Augments, drones: ship.Drones, isShip: true }"
              :blueprints="blueprints"
              :level="level + 1"
              @showWeapon="$emit('showWeapon', $event)"
              @showCrew="$emit('showCrew', $event)"
              @showAugment="$emit('showAugment', $event)"
              @showDrone="$emit('showDrone', $event)"
              @showShip="$emit('showShip', $event)">
            </event-tree>
          </div>
        </div>
        
        <!-- Weapons -->
        <div v-if="event.weapons && event.weapons.length > 0" class="event-assets">
          <div class="event-section-title">Weapons:</div>
          <div class="asset-list">
            <span v-for="weapon in event.weapons" :key="weapon.Name" class="asset-tag weapon clickable" @click="showWeaponDetails(weapon.Name)">
              {{ blueprints?.weapons?.find(w => w.Name === weapon.Name)?.Title || weapon.Name }}
            </span>
          </div>
        </div>
        
        <!-- Crew -->
        <div v-if="event.crew && event.crew.length > 0" class="event-assets">
          <div class="event-section-title">Crew:</div>
          <div class="asset-list">
            <span v-for="crew in event.crew" :key="crew.name" class="asset-tag crew clickable" @click="showCrewDetails(crew.name)">
              {{ blueprints?.crew?.find(c => c.name === crew.name)?.title || crew.name }}
            </span>
          </div>
        </div>
        
        <!-- Augments -->
        <div v-if="event.augments && event.augments.length > 0" class="event-assets">
          <div class="event-section-title">Augments:</div>
          <div class="asset-list">
            <span v-for="augment in event.augments" :key="augment.Name" class="asset-tag augment clickable" @click="showAugmentDetails(augment.Name)">
              {{ blueprints?.augments?.find(a => a.Name === augment.Name)?.Title || augment.Name }}
            </span>
          </div>
        </div>
        
        <!-- Drones -->
        <div v-if="event.drones && event.drones.length > 0" class="event-assets">
          <div class="event-section-title">Drones:</div>
          <div class="asset-list">
            <span v-for="drone in event.drones" :key="drone.Name" class="asset-tag drone clickable" @click="showDroneDetailsLocal(drone.Name)">
              {{ blueprints?.drones?.find(d => d.Name === drone.Name)?.Title || drone.Name }}
            </span>
          </div>
        </div>
        
        <!-- Quests (nested as event nodes) -->
        <div v-if="event.quests && event.quests.length > 0" class="event-children">
          <div class="event-section-title">Quest Events:</div>
          <div v-for="(quest, index) in event.quests" :key="'quest-' + quest.EventName + '-' + index" :id="'quest-' + quest.EventName">
            <event-tree 
              :event="{ id: quest.EventName, Name: quest.Name, text: quest.Text, Events: quest.Events, Ships: quest.Ships, weapons: quest.weapons, crew: quest.crew, augments: quest.augments, drones: quest.drones }"
              :blueprints="blueprints"
              :level="level + 1"
              @showWeapon="$emit('showWeapon', $event)"
              @showCrew="$emit('showCrew', $event)"
              @showAugment="$emit('showAugment', $event)"
              @showDrone="$emit('showDrone', $event)"
              @showShip="$emit('showShip', $event)">
            </event-tree>
          </div>
        </div>
      </div>
    </div>
  `
};

// Header Component
const AppHeader = {
  props: ['hideCommon'],
  emits: ['toggleHideCommon'],
  template: `
    <header class="app-header">
      <h1>FTL Multiverse - Sectors Viewer</h1>
      <div class="header-controls">
        <label class="toggle-label">
          <input 
            type="checkbox" 
            :checked="hideCommon" 
            @change="$emit('toggleHideCommon')"
            class="toggle-checkbox">
          <span>Show Only Non-Purchaseable Items</span>
        </label>
      </div>
    </header>
  `
};

// Navigation Component
const SectorNavigation = {
  props: ['sectors', 'selectedSector'],
  emits: ['selectSector'],
  data() {
    return {
      collapsed: {
        uniqueCivilian: false,
        uniqueNeutral: false,
        uniqueHostile: false,
        uniqueNebula: false,
        uniqueSecret: true,
        uniqueOther: false,
        standardCivilian: false,
        standardNeutral: false,
        standardHostile: false,
        standardNebula: false,
        standardSecret: true,
        standardOther: false
      }
    };
  },
  computed: {
    uniqueCivilian() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'CIVILIAN').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueNeutral() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'NEUTRAL').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueHostile() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'HOSTILE').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueNebula() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'NEBULA').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueSecret() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'SECRET').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueOther() {
      return this.sectors.filter(s => s.unique === 'true' && !s.colorType).sort((a, b) => a.name.localeCompare(b.name));
    },
    standardCivilian() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'CIVILIAN').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardNeutral() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'NEUTRAL').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardHostile() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'HOSTILE').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardNebula() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'NEBULA').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardSecret() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'SECRET').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardOther() {
      return this.sectors.filter(s => s.unique !== 'true' && !s.colorType).sort((a, b) => a.name.localeCompare(b.name));
    }
  },
  methods: {
    toggleCollapse(section) {
      this.collapsed[section] = !this.collapsed[section];
    }
  },
  template: `
    <nav class="sector-nav">
      <h2>Sectors</h2>
      
      <div class="nav-category">
        <h3 class="nav-category-title">Unique</h3>
        
        <div v-if="uniqueCivilian.length > 0" class="nav-group">
          <div class="nav-group-header civilian" @click="toggleCollapse('uniqueCivilian')">
            <span class="collapse-icon">{{ collapsed.uniqueCivilian ? '▶' : '▼' }}</span>
            <span class="nav-badge civilian">CIVILIAN</span>
            <span class="nav-count">({{ uniqueCivilian.length }})</span>
          </div>
          <div v-show="!collapsed.uniqueCivilian" class="nav-items">
            <div v-for="sector in uniqueCivilian" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueNeutral.length > 0" class="nav-group">
          <div class="nav-group-header neutral" @click="toggleCollapse('uniqueNeutral')">
            <span class="collapse-icon">{{ collapsed.uniqueNeutral ? '▶' : '▼' }}</span>
            <span class="nav-badge neutral">NEUTRAL</span>
            <span class="nav-count">({{ uniqueNeutral.length }})</span>
          </div>
          <div v-show="!collapsed.uniqueNeutral" class="nav-items">
            <div v-for="sector in uniqueNeutral" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueHostile.length > 0" class="nav-group">
          <div class="nav-group-header hostile" @click="toggleCollapse('uniqueHostile')">
            <span class="collapse-icon">{{ collapsed.uniqueHostile ? '▶' : '▼' }}</span>
            <span class="nav-badge hostile">HOSTILE</span>
            <span class="nav-count">({{ uniqueHostile.length }})</span>
          </div>
          <div v-show="!collapsed.uniqueHostile" class="nav-items">
            <div v-for="sector in uniqueHostile" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueNebula.length > 0" class="nav-group">
          <div class="nav-group-header nebula" @click="toggleCollapse('uniqueNebula')">
            <span class="collapse-icon">{{ collapsed.uniqueNebula ? '▶' : '▼' }}</span>
            <span class="nav-badge nebula">NEBULA</span>
            <span class="nav-count">({{ uniqueNebula.length }})</span>
          </div>
          <div v-show="!collapsed.uniqueNebula" class="nav-items">
            <div v-for="sector in uniqueNebula" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueSecret.length > 0" class="nav-group">
          <div class="nav-group-header secret" @click="toggleCollapse('uniqueSecret')">
            <span class="collapse-icon">{{ collapsed.uniqueSecret ? '▶' : '▼' }}</span>
            <span class="nav-badge secret">SECRET</span>
            <span class="nav-count">({{ uniqueSecret.length }})</span>
          </div>
          <div v-show="!collapsed.uniqueSecret" class="nav-items">
            <div v-for="sector in uniqueSecret" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueOther.length > 0" class="nav-group">
          <div class="nav-group-header" @click="toggleCollapse('uniqueOther')">
            <span class="collapse-icon">{{ collapsed.uniqueOther ? '▶' : '▼' }}</span>
            <span>Other</span>
            <span class="nav-count">({{ uniqueOther.length }})</span>
          </div>
          <div v-show="!collapsed.uniqueOther" class="nav-items">
            <div v-for="sector in uniqueOther" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="nav-category">
        <h3 class="nav-category-title">Standard</h3>
        
        <div v-if="standardCivilian.length > 0" class="nav-group">
          <div class="nav-group-header civilian" @click="toggleCollapse('standardCivilian')">
            <span class="collapse-icon">{{ collapsed.standardCivilian ? '▶' : '▼' }}</span>
            <span class="nav-badge civilian">CIVILIAN</span>
            <span class="nav-count">({{ standardCivilian.length }})</span>
          </div>
          <div v-show="!collapsed.standardCivilian" class="nav-items">
            <div v-for="sector in standardCivilian" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardNeutral.length > 0" class="nav-group">
          <div class="nav-group-header neutral" @click="toggleCollapse('standardNeutral')">
            <span class="collapse-icon">{{ collapsed.standardNeutral ? '▶' : '▼' }}</span>
            <span class="nav-badge neutral">NEUTRAL</span>
            <span class="nav-count">({{ standardNeutral.length }})</span>
          </div>
          <div v-show="!collapsed.standardNeutral" class="nav-items">
            <div v-for="sector in standardNeutral" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardHostile.length > 0" class="nav-group">
          <div class="nav-group-header hostile" @click="toggleCollapse('standardHostile')">
            <span class="collapse-icon">{{ collapsed.standardHostile ? '▶' : '▼' }}</span>
            <span class="nav-badge hostile">HOSTILE</span>
            <span class="nav-count">({{ standardHostile.length }})</span>
          </div>
          <div v-show="!collapsed.standardHostile" class="nav-items">
            <div v-for="sector in standardHostile" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardNebula.length > 0" class="nav-group">
          <div class="nav-group-header nebula" @click="toggleCollapse('standardNebula')">
            <span class="collapse-icon">{{ collapsed.standardNebula ? '▶' : '▼' }}</span>
            <span class="nav-badge nebula">NEBULA</span>
            <span class="nav-count">({{ standardNebula.length }})</span>
          </div>
          <div v-show="!collapsed.standardNebula" class="nav-items">
            <div v-for="sector in standardNebula" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardSecret.length > 0" class="nav-group">
          <div class="nav-group-header secret" @click="toggleCollapse('standardSecret')">
            <span class="collapse-icon">{{ collapsed.standardSecret ? '▶' : '▼' }}</span>
            <span class="nav-badge secret">SECRET</span>
            <span class="nav-count">({{ standardSecret.length }})</span>
          </div>
          <div v-show="!collapsed.standardSecret" class="nav-items">
            <div v-for="sector in standardSecret" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardOther.length > 0" class="nav-group">
          <div class="nav-group-header" @click="toggleCollapse('standardOther')">
            <span class="collapse-icon">{{ collapsed.standardOther ? '▶' : '▼' }}</span>
            <span>Other</span>
            <span class="nav-count">({{ standardOther.length }})</span>
          </div>
          <div v-show="!collapsed.standardOther" class="nav-items">
            <div v-for="sector in standardOther" :key="sector.ID"
                 class="sector-item"
                 :class="{ active: selectedSector && selectedSector.ID === sector.ID }"
                 @click="$emit('selectSector', sector)">
              <div class="sector-name">{{ sector.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
};

// Sector Overview Component
const SectorOverview = {
  props: ['sectors'],
  emits: ['selectSector'],
  data() {
    return {
      collapsed: {
        uniqueCivilian: false,
        uniqueNeutral: false,
        uniqueHostile: false,
        uniqueNebula: false,
        uniqueSecret: true, // collapsed by default
        uniqueOther: false,
        standardCivilian: false,
        standardNeutral: false,
        standardHostile: false,
        standardNebula: false,
        standardSecret: true, // collapsed by default
        standardOther: false
      }
    };
  },
  methods: {
    toggleCollapse(section) {
      this.collapsed[section] = !this.collapsed[section];
    }
  },
  computed: {
    uniqueCivilian() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'CIVILIAN').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueNeutral() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'NEUTRAL').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueHostile() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'HOSTILE').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueNebula() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'NEBULA').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueSecret() {
      return this.sectors.filter(s => s.unique === 'true' && s.colorType === 'SECRET').sort((a, b) => a.name.localeCompare(b.name));
    },
    uniqueOther() {
      return this.sectors.filter(s => s.unique === 'true' && !s.colorType).sort((a, b) => a.name.localeCompare(b.name));
    },
    standardCivilian() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'CIVILIAN').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardNeutral() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'NEUTRAL').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardHostile() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'HOSTILE').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardNebula() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'NEBULA').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardSecret() {
      return this.sectors.filter(s => s.unique !== 'true' && s.colorType === 'SECRET').sort((a, b) => a.name.localeCompare(b.name));
    },
    standardOther() {
      return this.sectors.filter(s => s.unique !== 'true' && !s.colorType).sort((a, b) => a.name.localeCompare(b.name));
    }
  },
  template: `
    <div class="sector-overview">
      <div class="overview-header">
        <h2>FTL Multiverse Sectors</h2>
        <p class="overview-desc">Select any sector to view detailed information about available weapons, crew, augments, and more.</p>
      </div>

      <div class="sector-category">
        <h3>Unique Sectors</h3>
        
        <div v-if="uniqueCivilian.length > 0" class="color-group">
          <h4 class="color-group-title civilian collapsible" @click="toggleCollapse('uniqueCivilian')">
            <span class="collapse-icon">{{ collapsed.uniqueCivilian ? '▶' : '▼' }}</span>
            <span class="color-badge civilian">CIVILIAN</span>
            Peaceful / Allied ({{ uniqueCivilian.length }})
          </h4>
          <div v-show="!collapsed.uniqueCivilian" class="sector-grid">
            <div v-for="sector in uniqueCivilian" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueNeutral.length > 0" class="color-group">
          <h4 class="color-group-title neutral collapsible" @click="toggleCollapse('uniqueNeutral')">
            <span class="collapse-icon">{{ collapsed.uniqueNeutral ? '▶' : '▼' }}</span>
            <span class="color-badge neutral">NEUTRAL</span>
            Neutral Territory ({{ uniqueNeutral.length }})
          </h4>
          <div v-show="!collapsed.uniqueNeutral" class="sector-grid">
            <div v-for="sector in uniqueNeutral" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueHostile.length > 0" class="color-group">
          <h4 class="color-group-title hostile collapsible" @click="toggleCollapse('uniqueHostile')">
            <span class="collapse-icon">{{ collapsed.uniqueHostile ? '▶' : '▼' }}</span>
            <span class="color-badge hostile">HOSTILE</span>
            Hostile Territory ({{ uniqueHostile.length }})
          </h4>
          <div v-show="!collapsed.uniqueHostile" class="sector-grid">
            <div v-for="sector in uniqueHostile" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueNebula.length > 0" class="color-group">
          <h4 class="color-group-title nebula collapsible" @click="toggleCollapse('uniqueNebula')">
            <span class="collapse-icon">{{ collapsed.uniqueNebula ? '▶' : '▼' }}</span>
            <span class="color-badge nebula">NEBULA</span>
            Hazardous Nebulae ({{ uniqueNebula.length }})
          </h4>
          <div v-show="!collapsed.uniqueNebula" class="sector-grid">
            <div v-for="sector in uniqueNebula" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueSecret.length > 0" class="color-group">
          <h4 class="color-group-title secret collapsible" @click="toggleCollapse('uniqueSecret')">
            <span class="collapse-icon">{{ collapsed.uniqueSecret ? '▶' : '▼' }}</span>
            <span class="color-badge secret">SECRET</span>
            Secret Sectors ({{ uniqueSecret.length }})
          </h4>
          <div v-show="!collapsed.uniqueSecret" class="sector-grid">
            <div v-for="sector in uniqueSecret" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="uniqueOther.length > 0" class="color-group">
          <h4 class="color-group-title collapsible" @click="toggleCollapse('uniqueOther')">
            <span class="collapse-icon">{{ collapsed.uniqueOther ? '▶' : '▼' }}</span>
            Other ({{ uniqueOther.length }})
          </h4>
          <div v-show="!collapsed.uniqueOther" class="sector-grid">
            <div v-for="sector in uniqueOther" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="sector-category">
        <h3>Standard Sectors</h3>
        
        <div v-if="standardCivilian.length > 0" class="color-group">
          <h4 class="color-group-title civilian collapsible" @click="toggleCollapse('standardCivilian')">
            <span class="collapse-icon">{{ collapsed.standardCivilian ? '▶' : '▼' }}</span>
            <span class="color-badge civilian">CIVILIAN</span>
            Peaceful / Allied ({{ standardCivilian.length }})
          </h4>
          <div v-show="!collapsed.standardCivilian" class="sector-grid">
            <div v-for="sector in standardCivilian" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardNeutral.length > 0" class="color-group">
          <h4 class="color-group-title neutral collapsible" @click="toggleCollapse('standardNeutral')">
            <span class="collapse-icon">{{ collapsed.standardNeutral ? '▶' : '▼' }}</span>
            <span class="color-badge neutral">NEUTRAL</span>
            Neutral Territory ({{ standardNeutral.length }})
          </h4>
          <div v-show="!collapsed.standardNeutral" class="sector-grid">
            <div v-for="sector in standardNeutral" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardHostile.length > 0" class="color-group">
          <h4 class="color-group-title hostile collapsible" @click="toggleCollapse('standardHostile')">
            <span class="collapse-icon">{{ collapsed.standardHostile ? '▶' : '▼' }}</span>
            <span class="color-badge hostile">HOSTILE</span>
            Hostile Territory ({{ standardHostile.length }})
          </h4>
          <div v-show="!collapsed.standardHostile" class="sector-grid">
            <div v-for="sector in standardHostile" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardNebula.length > 0" class="color-group">
          <h4 class="color-group-title nebula collapsible" @click="toggleCollapse('standardNebula')">
            <span class="collapse-icon">{{ collapsed.standardNebula ? '▶' : '▼' }}</span>
            <span class="color-badge nebula">NEBULA</span>
            Hazardous Nebulae ({{ standardNebula.length }})
          </h4>
          <div v-show="!collapsed.standardNebula" class="sector-grid">
            <div v-for="sector in standardNebula" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardSecret.length > 0" class="color-group">
          <h4 class="color-group-title secret collapsible" @click="toggleCollapse('standardSecret')">
            <span class="collapse-icon">{{ collapsed.standardSecret ? '▶' : '▼' }}</span>
            <span class="color-badge secret">SECRET</span>
            Secret Sectors ({{ standardSecret.length }})
          </h4>
          <div v-show="!collapsed.standardSecret" class="sector-grid">
            <div v-for="sector in standardSecret" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>

        <div v-if="standardOther.length > 0" class="color-group">
          <h4 class="color-group-title collapsible" @click="toggleCollapse('standardOther')">
            <span class="collapse-icon">{{ collapsed.standardOther ? '▶' : '▼' }}</span>
            Other ({{ standardOther.length }})
          </h4>
          <div v-show="!collapsed.standardOther" class="sector-grid">
            <div v-for="sector in standardOther" :key="sector.ID" 
                 class="sector-card" 
                 @click="$emit('selectSector', sector)">
              <div class="sector-card-name">{{ sector.name }}</div>
              <div class="sector-card-id">{{ sector.ID }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

// Sector Detail Component
const SectorDetail = {
  props: ['sector', 'blueprints', 'hideCommon', 'allSectors'],
  emits: ['selectSector'],
  data() {
    return {
      activeTab: 'weapons',
      selectedItem: null,
      selectedItemType: null,
      crewAnimationInterval: null,
      crewSpriteSheet: null,
      weaponAnimationInterval: null,
      weaponSpriteSheet: null,
      droneAnimationInterval: null,
      droneSpriteSheet: null
    };
  },
  computed: {
    filteredWeapons() {
      if (!this.sector?.weapons) return [];
      return this.hideCommon ? this.sector.weapons.filter(w => w.rarity === 0) : this.sector.weapons;
    },
    filteredCrew() {
      if (!this.sector?.crew) return [];
      return this.hideCommon ? this.sector.crew.filter(c => c.rarity === 0) : this.sector.crew;
    },
    filteredAugments() {
      if (!this.sector?.augments) return [];
      return this.hideCommon ? this.sector.augments.filter(a => a.rarity === 0) : this.sector.augments;
    },
    filteredDrones() {
      if (!this.sector?.drones) return [];
      return this.hideCommon ? this.sector.drones.filter(d => d.rarity === 0) : this.sector.drones;
    }
  },
  methods: {
    getCrewImagePath(crewName) {
      return `/img/people/${crewName}_base.png`;
    },
    getDroneImagePath(droneImage, suffix = 'on') {
      return `/img/ship/drones/${droneImage}_${suffix}.png`;
    },
    handleImageError(event) {
      event.target.style.display = 'none';
    },
    showWeaponDetails(weaponName) {
      if (!this.blueprints || !this.blueprints.weapons) return;
      const weapon = this.blueprints.weapons.find(w => w.Name === weaponName);
      if (weapon) {
        this.selectedItem = weapon;
        this.selectedItemType = 'weapon';
      }
    },
    showCrewDetails(crewName) {
      if (!this.blueprints || !this.blueprints.crew) return;
      const crew = this.blueprints.crew.find(c => c.name === crewName);
      if (crew) {
        this.selectedItem = crew;
        this.selectedItemType = 'crew';
      }
    },
    showAugmentDetails(augmentName) {
      console.log('showAugmentDetails called with:', augmentName);
      if (!this.blueprints || !this.blueprints.augments) {
        console.log('No blueprints or augments available');
        return;
      }
      const augment = this.blueprints.augments.find(a => a.Name === augmentName);
      console.log('Found augment:', augment);
      console.log('Augment properties:', augment ? Object.keys(augment) : 'none');
      if (augment) {
        this.selectedItem = augment;
        this.selectedItemType = 'augment';
        console.log('Set selectedItem and selectedItemType to augment');
      }
    },
    showDroneDetails(droneName) {
      console.log('showDroneDetails called with:', droneName);
      if (!this.blueprints || !this.blueprints.drones) {
        console.log('No blueprints or drones available');
        return;
      }
      const drone = this.blueprints.drones.find(d => d.Name === droneName);
      console.log('Found drone:', drone);
      console.log('Drone properties:', drone ? Object.keys(drone) : 'none');
      if (drone) {
        this.selectedItem = drone;
        this.selectedItemType = 'drone';
        console.log('Set selectedItem and selectedItemType to drone');
      }
    },
    showShipDetails(shipName) {
      if (!this.blueprints || !this.blueprints.shipBlueprints) return;
      const ship = this.blueprints.shipBlueprints.find(s => s.name === shipName);
      if (ship) {
        this.selectedItem = ship;
        this.selectedItemType = 'ship';
      }
    },
    scrollToQuest(questEventName) {
      // Switch to events tab
      this.activeTab = 'events';
      // Wait for tab to render, then scroll to quest
      this.$nextTick(() => {
        const questElement = document.getElementById('quest-' + questEventName);
        if (questElement) {
          questElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Highlight the quest briefly
          questElement.classList.add('highlight-quest');
          setTimeout(() => {
            questElement.classList.remove('highlight-quest');
          }, 2000);
        }
      });
    },
    closeModal() {
      this.stopCrewAnimation();
      this.stopWeaponAnimation();
      this.stopDroneAnimation();
      this.selectedItem = null;
      this.selectedItemType = null;
    },
    stopCrewAnimation() {
      if (this.crewAnimationInterval) {
        clearInterval(this.crewAnimationInterval);
        this.crewAnimationInterval = null;
      }
      this.crewSpriteSheet = null;
    },
    getFallbackAnimationData(crewName) {
      // Fallback animation data for crew without animation data (like base "human")
      return {
        sheet: crewName,
        animSheetPath: `people/${crewName}_base.png`,
        animSheetWidth: 315,
        animSheetHeight: 455,
        frameWidth: 35,
        frameHeight: 35,
        animations: {
          [`${crewName}_walk_down`]: { name: `${crewName}_walk_down`, length: 4, x: 0, y: 12, time: 1 },
          [`${crewName}_walk_right`]: { name: `${crewName}_walk_right`, length: 4, x: 4, y: 12, time: 1 },
          [`${crewName}_walk_up`]: { name: `${crewName}_walk_up`, length: 4, x: 0, y: 11, time: 1 },
          [`${crewName}_walk_left`]: { name: `${crewName}_walk_left`, length: 4, x: 4, y: 11, time: 1 }
        }
      };
    },
    startCrewAnimation() {
      this.stopCrewAnimation();
      
      const canvas = this.$refs.crewCanvas;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      // Use animation data from blueprint, or fallback to default structure
      const animData = this.selectedItem.animationData || this.getFallbackAnimationData(this.selectedItem.name);
      
      // Find walk_down animation
      const walkDownKey = Object.keys(animData.animations).find(key => key.includes('walk_down'));
      if (!walkDownKey) return;
      
      const walkAnim = animData.animations[walkDownKey];
      const frameWidth = animData.frameWidth;
      const frameHeight = animData.frameHeight;
      
      // Load sprite sheet
      const img = new Image();
      img.onload = () => {
        this.crewSpriteSheet = img;
        let currentFrame = 0;
        
        // Animation loop
        const animate = () => {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Calculate source position in sprite sheet
          const srcX = (walkAnim.x + currentFrame) * frameWidth;
          // FTL sprite sheets use inverted Y (0 at bottom, increasing upward)
          const totalRows = Math.floor(animData.animSheetHeight / frameHeight);
          const srcY = (totalRows - 1 - walkAnim.y) * frameHeight;
          
          // Draw scaled up (3x) for better visibility
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            img,
            srcX, srcY, frameWidth, frameHeight,
            0, 0, canvas.width, canvas.height
          );
          
          // Next frame
          currentFrame = (currentFrame + 1) % walkAnim.length;
        };
        
        // Start animation (150ms per frame, adjusted by time multiplier)
        const frameTime = 150 / (walkAnim.time || 1);
        animate(); // Draw first frame immediately
        this.crewAnimationInterval = setInterval(animate, frameTime);
      };
      
      img.onerror = () => {
        console.error('Failed to load crew sprite sheet:', animData.animSheetPath);
      };
      
      img.src = `/img/${animData.animSheetPath}`;
    },
    stopWeaponAnimation() {
      if (this.weaponAnimationInterval) {
        clearInterval(this.weaponAnimationInterval);
        this.weaponAnimationInterval = null;
      }
      this.weaponSpriteSheet = null;
    },
    startWeaponAnimation() {
      this.stopWeaponAnimation();
      
      const canvas = this.$refs.weaponCanvas;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const animData = this.selectedItem.animationData;
      
      if (!animData.fireFrame) return;
      
      const frameWidth = animData.frameWidth;
      const frameHeight = animData.frameHeight;
      
      // Load sprite sheet
      const img = new Image();
      img.onload = () => {
        this.weaponSpriteSheet = img;
        
        // Just show the first frame (no animation)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate source position in sprite sheet (first frame)
        const srcX = animData.x * frameWidth;
        const srcY = animData.y * frameHeight;
        
        // Calculate scale to fit canvas while maintaining aspect ratio
        // Note: After rotation, width and height are swapped
        const scale = Math.min(canvas.width / frameHeight, canvas.height / frameWidth);
        const drawWidth = frameHeight * scale;
        const drawHeight = frameWidth * scale;
        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;
        
        // Draw weapon frame with 90 degree clockwise rotation
        ctx.imageSmoothingEnabled = false;
        ctx.save();
        // Translate to center of where the image will be
        ctx.translate(offsetX + drawWidth / 2, offsetY + drawHeight / 2);
        // Rotate 90 degrees clockwise (π/2 radians)
        ctx.rotate(Math.PI / 2);
        // Draw with center at origin
        ctx.drawImage(
          img,
          srcX, srcY, frameWidth, frameHeight,
          -drawHeight / 2, -drawWidth / 2, drawHeight, drawWidth
        );
        ctx.restore();
      };
      
      img.onerror = () => {
        console.error('Failed to load weapon sprite sheet:', animData.animSheetPath);
      };
      
      img.src = `/img/${animData.animSheetPath}`;
    },
    getCrewDroneAnimationData(droneName) {
      // Use the crewBlueprint mapping from hyperspace.xml
      const drone = this.blueprints?.drones?.find(d => d.Name === droneName);
      if (!drone?.crewBlueprint) return null;
      
      const crew = this.blueprints?.crew?.find(c => c.name === drone.crewBlueprint);
      return crew?.animationData || this.getFallbackAnimationData(drone.crewBlueprint);
    },
    stopDroneAnimation() {
      if (this.droneAnimationInterval) {
        clearInterval(this.droneAnimationInterval);
        this.droneAnimationInterval = null;
      }
      this.droneSpriteSheet = null;
    },
    startDroneAnimation() {
      this.stopDroneAnimation();
      
      const canvas = this.$refs.droneCanvas;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const animData = this.getCrewDroneAnimationData(this.selectedItem.Name);
      if (!animData) return;
      
      // Find walk_down animation
      const walkDownKey = Object.keys(animData.animations).find(key => key.includes('walk_down'));
      if (!walkDownKey) return;
      
      const walkAnim = animData.animations[walkDownKey];
      const frameWidth = animData.frameWidth;
      const frameHeight = animData.frameHeight;
      
      // Load sprite sheet
      const img = new Image();
      img.onload = () => {
        this.droneSpriteSheet = img;
        let currentFrame = 0;
        
        // Animation loop
        const animate = () => {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Calculate source position in sprite sheet
          const srcX = (walkAnim.x + currentFrame) * frameWidth;
          // FTL sprite sheets use inverted Y (0 at bottom, increasing upward)
          const totalRows = Math.floor(animData.animSheetHeight / frameHeight);
          const srcY = (totalRows - 1 - walkAnim.y) * frameHeight;
          
          // Draw scaled up (3x) for better visibility
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            img,
            srcX, srcY, frameWidth, frameHeight,
            0, 0, canvas.width, canvas.height
          );
          
          // Next frame
          currentFrame = (currentFrame + 1) % walkAnim.length;
        };
        
        // Start animation (150ms per frame, adjusted by time multiplier)
        const frameTime = 150 / (walkAnim.time || 1);
        animate(); // Draw first frame immediately
        this.droneAnimationInterval = setInterval(animate, frameTime);
      };
      
      img.onerror = () => {
        console.error('Failed to load drone sprite sheet:', animData.animSheetPath);
      };
      
      img.src = `/img/${animData.animSheetPath}`;
    }
  },
  updated() {
    if (this.selectedItemType === 'crew' && this.selectedItem && this.$refs.crewCanvas) {
      this.startCrewAnimation();
    }
    if (this.selectedItemType === 'weapon' && this.selectedItem?.animationData && this.$refs.weaponCanvas) {
      this.startWeaponAnimation();
    }
    if (this.selectedItemType === 'drone' && this.selectedItem?.crewBlueprint && this.$refs.droneCanvas) {
      this.startDroneAnimation();
    }
  },
  beforeUnmount() {
    this.stopCrewAnimation();
    this.stopWeaponAnimation();
    this.stopDroneAnimation();
  },
  template: `
    <main class="sector-detail">
      <sector-overview v-if="!sector" 
        :sectors="allSectors"
        @select-sector="$emit('selectSector', $event)">
      </sector-overview>
      <div v-else class="detail-content">
        <div class="sector-header">
          <h2>{{ sector.name }}</h2>
          <div class="sector-meta">
            <span class="badge">ID: {{ sector.ID }}</span>
            <span v-if="sector.unique === 'true'" class="badge unique">Unique</span>
            <span v-if="sector.colorType" :class="['badge', 'color-type', sector.colorType.toLowerCase()]">
              {{ sector.colorType }}
            </span>
            <span v-if="sector.sectorTypes && sector.sectorTypes.length > 0" class="sector-types">
              Types: {{ sector.sectorTypes.join(', ') }}
            </span>
            <span v-if="sector.alternateNames && sector.alternateNames.length > 0" class="alt-names">
              Alternate Names: {{ sector.alternateNames.join(', ') }}
            </span>
          </div>
        </div>

        <div class="tabs">
          <button 
            :class="{ active: activeTab === 'weapons' }"
            @click="activeTab = 'weapons'">
            Weapons ({{ filteredWeapons.length }})
          </button>
          <button 
            :class="{ active: activeTab === 'crew' }"
            @click="activeTab = 'crew'">
            Crew ({{ filteredCrew.length }})
          </button>
          <button 
            :class="{ active: activeTab === 'augments' }"
            @click="activeTab = 'augments'">
            Augments ({{ filteredAugments.length }})
          </button>
          <button 
            :class="{ active: activeTab === 'drones' }"
            @click="activeTab = 'drones'">
            Drones ({{ filteredDrones.length }})
          </button>
          <button 
            :class="{ active: activeTab === 'ships' }"
            @click="activeTab = 'ships'">
            Ship Unlocks ({{ sector.shipUnlocks?.length || 0 }})
          </button>
          <button 
            :class="{ active: activeTab === 'quests' }"
            @click="activeTab = 'quests'">
            Quests ({{ sector.quests?.length || 0 }})
          </button>
          <button 
            :class="{ active: activeTab === 'events' }"
            @click="activeTab = 'events'">
            Event Tree ({{ sector.events?.length || 0 }})
          </button>
        </div>

        <div class="tab-content">
          <!-- Weapons Tab -->
          <div v-if="activeTab === 'weapons'" class="data-list">
            <div v-if="filteredWeapons.length === 0" class="empty-state">
              No weapons available in this sector
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Weapon</th>
                    <th>Rarity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="weapon in filteredWeapons" :key="weapon.Name">
                    <td>
                      <a href="#" @click.prevent="showWeaponDetails(weapon.Name)" class="item-link">
                        {{ blueprints?.weapons?.find(w => w.Name === weapon.Name)?.Title || weapon.Name }}
                      </a>
                    </td>
                    <td>{{ weapon.rarity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Crew Tab -->
          <div v-if="activeTab === 'crew'" class="data-list">
            <div v-if="filteredCrew.length === 0" class="empty-state">
              No crew available in this sector
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Crew</th>
                    <th>Rarity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="crew in filteredCrew" :key="crew.name + (crew.crewName || '')">
                    <td>
                      <a href="#" @click.prevent="showCrewDetails(crew.name)" class="item-link">
                        {{ crew.crewName ? crew.crewName + ' (' + (blueprints?.crew?.find(c => c.name === crew.name)?.title || crew.name) + ')' : (blueprints?.crew?.find(c => c.name === crew.name)?.title || crew.name) }}
                      </a>
                    </td>
                    <td>{{ crew.rarity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Augments Tab -->
          <div v-if="activeTab === 'augments'" class="data-list">
            <div v-if="filteredAugments.length === 0" class="empty-state">
              No augments available in this sector
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Augment</th>
                    <th>Rarity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="augment in filteredAugments" :key="augment.name">
                    <td>
                      <a href="#" @click.prevent="showAugmentDetails(augment.Name)" class="item-link">
                        {{ blueprints?.augments?.find(a => a.Name === augment.Name)?.Title || augment.Name }}
                      </a>
                    </td>
                    <td>{{ augment.rarity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Drones Tab -->
          <div v-if="activeTab === 'drones'" class="data-list">
            <div v-if="filteredDrones.length === 0" class="empty-state">
              No drones available in this sector
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Drone</th>
                    <th>Rarity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="drone in filteredDrones" :key="drone.name">
                    <td>
                      <a href="#" @click.prevent="showDroneDetails(drone.Name)" class="item-link">
                        {{ blueprints?.drones?.find(d => d.Name === drone.Name)?.Title || drone.Name }}
                      </a>
                    </td>
                    <td>{{ drone.rarity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Ship Unlocks Tab -->
          <div v-if="activeTab === 'ships'" class="data-list">
            <div v-if="!sector.shipUnlocks || sector.shipUnlocks.length === 0" class="empty-state">
              No ship unlocks available in this sector
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Ship Name</th>
                    <th>Title</th>
                    <th>Silent</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ship in sector.shipUnlocks" :key="ship.Name">
                    <td>{{ ship.Name }}</td>
                    <td>{{ ship.Class }}</td>
                    <td>{{ ship.ShipName }}</td>
                    <td>{{ ship.Title }}</td>
                    <td>{{ ship.Silent ? 'Yes' : 'No' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quests Tab -->
          <div v-if="activeTab === 'quests'" class="data-list">
            <div v-if="!sector.quests || sector.quests.length === 0" class="empty-state">
              No quests available in this sector
            </div>
            <div v-else class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quest in sector.quests" :key="quest.EventName">
                    <td>
                      <a href="#" @click.prevent="scrollToQuest(quest.EventName)" class="item-link">
                        {{ quest.EventName }}
                      </a>
                    </td>
                    <td>{{ quest.Name }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Events Tab -->
          <div v-if="activeTab === 'events'" class="data-list">
            <div v-if="!sector.events || sector.events.length === 0" class="empty-state">
              No events available in this sector
            </div>
            <div v-else class="event-tree-container">
              <event-tree 
                v-for="(event, index) in sector.events" 
                :key="(event.id || event.Name) + '-' + index" 
                :event="event"
                :blueprints="blueprints"
                :level="0"
                @showWeapon="showWeaponDetails"
                @showCrew="showCrewDetails"
                @showAugment="showAugmentDetails"
                @showDrone="showDroneDetails"
                @showShip="showShipDetails">
              </event-tree>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for item details -->
      <div v-if="selectedItem" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          
          <!-- Weapon Details -->
          <div v-if="selectedItemType === 'weapon'">
            <h2>{{ selectedItem.Title || selectedItem.Name }}</h2>
            <canvas v-if="selectedItem.animationData" ref="weaponCanvas" class="modal-weapon-image" width="200" height="200"></canvas>
            <div class="modal-grid">
              <div><strong>Type:</strong> {{ selectedItem.type || '-' }}</div>
              <div><strong>Damage:</strong> {{ selectedItem.damage ?? '-' }}</div>
              <div><strong>Shots:</strong> {{ selectedItem.shots ?? '-' }}</div>
              <div><strong>Power:</strong> {{ selectedItem.power ?? '-' }}</div>
              <div><strong>Cooldown:</strong> {{ selectedItem.cooldown ?? '-' }}</div>
              <div><strong>Cost:</strong> {{ selectedItem.cost ?? '-' }}</div>
              <div><strong>Rarity:</strong> {{ selectedItem.rarity ?? '-' }}</div>
              <div><strong>Fire Chance:</strong> {{ selectedItem.fireChance ?? '-' }}</div>
              <div><strong>Breach Chance:</strong> {{ selectedItem.breachChance ?? '-' }}</div>
              <div v-if="selectedItem.missiles"><strong>Missiles:</strong> {{ selectedItem.missiles }}</div>
              <div v-if="selectedItem.stunChance"><strong>Stun Chance:</strong> {{ selectedItem.stunChance }}</div>
              <div v-if="selectedItem.persDamage"><strong>Crew Damage:</strong> {{ selectedItem.persDamage }}</div>
              <div v-if="selectedItem.speed"><strong>Speed:</strong> {{ selectedItem.speed }}</div>
              <div v-if="selectedItem.length"><strong>Length:</strong> {{ selectedItem.length }}</div>
              <div v-if="selectedItem.hullBust"><strong>Hull Bust:</strong> {{ selectedItem.hullBust }}</div>
              <div v-if="selectedItem.ion"><strong>Ion Damage:</strong> {{ selectedItem.ion }}</div>
              <div v-if="selectedItem.sysDamage"><strong>System Damage:</strong> {{ selectedItem.sysDamage }}</div>
              <div v-if="selectedItem.lockdown"><strong>Lockdown:</strong> {{ selectedItem.lockdown }}</div>
              <div v-if="selectedItem.radius"><strong>Radius:</strong> {{ selectedItem.radius }}</div>
              <div v-if="selectedItem.stun"><strong>Stun Duration:</strong> {{ selectedItem.stun }}</div>
              <div v-if="selectedItem.spin"><strong>Spin:</strong> {{ selectedItem.spin }}</div>
              <div v-if="selectedItem.chargeLevels"><strong>Charge Levels:</strong> {{ selectedItem.chargeLevels }}</div>
              <div v-if="selectedItem.drone_targetable !== undefined"><strong>Drone Targetable:</strong> {{ selectedItem.drone_targetable ? 'Yes' : 'No' }}</div>
            </div>
            <div v-if="selectedItem.desc" class="modal-desc">
              <strong>Description:</strong>
              <p>{{ selectedItem.desc }}</p>
            </div>
            <div v-if="selectedItem.tooltip" class="modal-desc">
              <strong>Tooltip:</strong>
              <p>{{ selectedItem.tooltip }}</p>
            </div>
            <div v-if="selectedItem.boost" class="modal-desc">
              <strong>Boost:</strong>
              <p>Type: {{ selectedItem.boost.type }}, Amount: {{ selectedItem.boost.amount }}, Count: {{ selectedItem.boost.count }}</p>
            </div>
            <div v-if="selectedItem.projectiles && selectedItem.projectiles.length > 0" class="modal-desc">
              <strong>Projectiles:</strong>
              <ul>
                <li v-for="(proj, idx) in selectedItem.projectiles" :key="idx">
                  Count: {{ proj.count }}, Type: {{ proj.type }}, Fake: {{ proj.fake ? 'Yes' : 'No' }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Crew Details -->
          <div v-if="selectedItemType === 'crew'">
            <h2>{{ selectedItem.title || selectedItem.name }}</h2>
            <canvas ref="crewCanvas" class="modal-crew-image" width="105" height="105"></canvas>
            <div class="modal-grid">
              <div><strong>Cost:</strong> {{ selectedItem.cost ?? '-' }}</div>
              <div><strong>Rarity:</strong> {{ selectedItem.rarity ?? '-' }}</div>
              <div v-if="selectedItem.bp"><strong>Blueprint Cost:</strong> {{ selectedItem.bp }}</div>
            </div>
            <div v-if="selectedItem.short" class="modal-desc">
              <strong>Short Name:</strong>
              <p>{{ selectedItem.short }}</p>
            </div>
            <div v-if="selectedItem.desc" class="modal-desc">
              <strong>Description:</strong>
              <p>{{ selectedItem.desc }}</p>
            </div>
            <div v-if="selectedItem.powerList && selectedItem.powerList.length > 0" class="modal-desc">
              <strong>Powers:</strong>
              <ul>
                <li v-for="power in selectedItem.powerList" :key="power">{{ power }}</li>
              </ul>
            </div>
          </div>

          <!-- Augment Details -->
          <div v-if="selectedItemType === 'augment'">
            <h2>{{ selectedItem.Title || selectedItem.Name }}</h2>
            <div class="modal-grid">
              <div v-if="selectedItem.cost !== undefined"><strong>Cost:</strong> {{ selectedItem.cost }}</div>
              <div v-if="selectedItem.rarity !== undefined"><strong>Rarity:</strong> {{ selectedItem.rarity }}</div>
              <div v-if="selectedItem.stackable !== undefined"><strong>Stackable:</strong> {{ selectedItem.stackable ? 'Yes' : 'No' }}</div>
              <div v-if="selectedItem.bp !== undefined"><strong>Blueprint Cost:</strong> {{ selectedItem.bp }}</div>
              <div v-if="selectedItem.value !== undefined && selectedItem.value !== null"><strong>Effect Value:</strong> {{ (selectedItem.value * 100).toFixed(0) }}%</div>
            </div>
            <div v-if="selectedItem.desc" class="modal-desc">
              <strong>Description:</strong>
              <p>{{ selectedItem.desc }}</p>
            </div>
          </div>

          <!-- Drone Details -->
          <div v-if="selectedItemType === 'drone'">
            <h2>{{ selectedItem.Title || selectedItem.Name }}</h2>
            <img v-if="selectedItem.type === 'COMBAT' && selectedItem.droneImage" :src="getDroneImagePath(selectedItem.droneImage)" :alt="selectedItem.droneImage" class="modal-drone-image" @error="handleImageError">
            <div v-if="selectedItem.type === 'DEFENSE' && selectedItem.droneImage" class="modal-drone-layered">
              <img :src="getDroneImagePath(selectedItem.droneImage, 'base')" :alt="selectedItem.droneImage + ' base'" class="modal-drone-base" @error="handleImageError">
              <img :src="getDroneImagePath(selectedItem.droneImage, 'gun')" :alt="selectedItem.droneImage + ' gun'" class="modal-drone-overlay" @error="handleImageError">
            </div>
            <canvas v-if="selectedItem.crewBlueprint && getCrewDroneAnimationData(selectedItem.Name)" ref="droneCanvas" class="modal-crew-image" width="105" height="105"></canvas>
            <div class="modal-grid">
              <div v-if="selectedItem.type"><strong>Type:</strong> {{ selectedItem.type }}</div>
              <div v-if="selectedItem.power !== undefined"><strong>Power:</strong> {{ selectedItem.power }}</div>
              <div v-if="selectedItem.cost !== undefined"><strong>Cost:</strong> {{ selectedItem.cost }}</div>
              <div v-if="selectedItem.rarity !== undefined"><strong>Rarity:</strong> {{ selectedItem.rarity }}</div>
              <div v-if="selectedItem.cooldown !== undefined"><strong>Cooldown:</strong> {{ selectedItem.cooldown }}</div>
              <div v-if="selectedItem.speed !== undefined"><strong>Speed:</strong> {{ selectedItem.speed }}</div>
              <div v-if="selectedItem.dodge !== undefined"><strong>Dodge:</strong> {{ selectedItem.dodge }}</div>
              <div v-if="selectedItem.bp !== undefined"><strong>Blueprint Cost:</strong> {{ selectedItem.bp }}</div>
              <div v-if="selectedItem.level !== undefined"><strong>Level:</strong> {{ selectedItem.level }}</div>
              <div v-if="selectedItem.target"><strong>Target:</strong> {{ selectedItem.target }}</div>
              <div v-if="selectedItem.locked !== undefined"><strong>Locked:</strong> {{ selectedItem.locked ? 'Yes' : 'No' }}</div>
              <div v-if="selectedItem.weaponBlueprint"><strong>Weapon:</strong> {{ selectedItem.weaponBlueprint }}</div>
              <div v-if="selectedItem.droneImage"><strong>Image:</strong> {{ selectedItem.droneImage }}</div>
              <div v-if="selectedItem.iconImage"><strong>Icon:</strong> {{ selectedItem.iconImage }}</div>
            </div>
            <div v-if="selectedItem.short" class="modal-desc">
              <strong>Short Name:</strong>
              <p>{{ selectedItem.short }}</p>
            </div>
            <div v-if="selectedItem.desc" class="modal-desc">
              <strong>Description:</strong>
              <p>{{ selectedItem.desc }}</p>
            </div>
            <div v-if="selectedItem.tip" class="modal-desc">
              <strong>Tip:</strong>
              <p>{{ selectedItem.tip }}</p>
            </div>
          </div>

          <!-- Ship Blueprint Details -->
          <div v-if="selectedItemType === 'ship'">
            <h2>{{ selectedItem.class || selectedItem.name }}</h2>
            <div class="modal-grid">
              <div><strong>Name:</strong> {{ selectedItem.name }}</div>
              <div v-if="selectedItem.layout"><strong>Layout:</strong> {{ selectedItem.layout }}</div>
              <div v-if="selectedItem.maxSector"><strong>Max Sector:</strong> {{ selectedItem.maxSector }}</div>
              <div v-if="selectedItem.health"><strong>Hull:</strong> {{ selectedItem.health }}</div>
              <div v-if="selectedItem.maxPower"><strong>Max Power:</strong> {{ selectedItem.maxPower }}</div>
              <div v-if="selectedItem.weaponSlots"><strong>Weapon Slots:</strong> {{ selectedItem.weaponSlots }}</div>
              <div v-if="selectedItem.droneSlots"><strong>Drone Slots:</strong> {{ selectedItem.droneSlots }}</div>
              <div v-if="selectedItem.boardingAI"><strong>Boarding AI:</strong> {{ selectedItem.boardingAI }}</div>
            </div>
            
            <div v-if="selectedItem.crewCount" class="modal-desc">
              <strong>Crew:</strong>
              <p>{{ selectedItem.crewCount.amount }} {{ selectedItem.crewCount.class }} (Max: {{ selectedItem.crewCount.max }})</p>
            </div>
            
            <div v-if="selectedItem.systemList && selectedItem.systemList.length > 0" class="modal-desc">
              <strong>Systems:</strong>
              <ul>
                <li v-for="(system, idx) in selectedItem.systemList" :key="idx">
                  <strong>{{ system.name }}:</strong> Power: {{ system.power }}/{{ system.max }} (Room: {{ system.room }})
                </li>
              </ul>
            </div>
            
            <div v-if="selectedItem.weaponList" class="modal-desc">
              <strong>Weapon Loadout:</strong>
              <p>Missiles: {{ selectedItem.weaponList.missiles ?? 0 }}, Count: {{ selectedItem.weaponList.count ?? 0 }}</p>
              <p v-if="selectedItem.weaponList.load"><em>Loads from: {{ selectedItem.weaponList.load }}</em></p>
            </div>
            
            <div v-if="selectedItem.droneList" class="modal-desc">
              <strong>Drone Loadout:</strong>
              <p>Drones: {{ selectedItem.droneList.drones ?? 0 }}, Count: {{ selectedItem.droneList.count ?? 0 }}</p>
            </div>
            
            <div v-if="selectedItem.augments && selectedItem.augments.length > 0" class="modal-desc">
              <strong>Augments:</strong>
              <ul>
                <li v-for="(aug, idx) in selectedItem.augments" :key="idx">{{ aug }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
};

// Main App
const app = createApp({
  data() {
    return {
      sectors: [],
      blueprints: null,
      selectedSector: null,
      loading: true,
      error: null,
      hideCommonItems: false
    };
  },
  methods: {
    async loadSectors() {
      try {
        const response = await fetch('./full-data.json');
        if (!response.ok) {
          throw new Error('Failed to load sectors data');
        }
        const data = await response.json();
        this.sectors = data.sectors;
        this.blueprints = data.blueprints;
        this.loading = false;
      } catch (err) {
        this.error = err.message;
        this.loading = false;
        console.error('Error loading sectors:', err);
      }
    },
    // Weapon helpers
    getWeaponTitle(weaponName) {
      if (!this.blueprints || !this.blueprints.weapons) return weaponName;
      const weapon = this.blueprints.weapons.find(w => w.Name === weaponName);
      return weapon?.Title || weaponName;
    },
    getWeaponType(weaponName) {
      if (!this.blueprints || !this.blueprints.weapons) return '-';
      const weapon = this.blueprints.weapons.find(w => w.Name === weaponName);
      return weapon?.type || '-';
    },
    getWeaponDesc(weaponName) {
      if (!this.blueprints || !this.blueprints.weapons) return '';
      const weapon = this.blueprints.weapons.find(w => w.Name === weaponName);
      return weapon?.desc || '';
    },
    getWeaponDamage(weaponName) {
      if (!this.blueprints || !this.blueprints.weapons) return '-';
      const weapon = this.blueprints.weapons.find(w => w.Name === weaponName);
      return weapon?.damage ?? '-';
    },
    getWeaponShots(weaponName) {
      if (!this.blueprints || !this.blueprints.weapons) return '-';
      const weapon = this.blueprints.weapons.find(w => w.Name === weaponName);
      return weapon?.shots ?? '-';
    },
    getWeaponPower(weaponName) {
      if (!this.blueprints || !this.blueprints.weapons) return '-';
      const weapon = this.blueprints.weapons.find(w => w.Name === weaponName);
      return weapon?.power ?? '-';
    },
    getWeaponCooldown(weaponName) {
      if (!this.blueprints || !this.blueprints.weapons) return '-';
      const weapon = this.blueprints.weapons.find(w => w.Name === weaponName);
      return weapon?.cooldown ?? '-';
    },
    getWeaponCost(weaponName) {
      if (!this.blueprints || !this.blueprints.weapons) return '-';
      const weapon = this.blueprints.weapons.find(w => w.Name === weaponName);
      return weapon?.cost ?? '-';
    },
    
    // Crew helpers
    getCrewTitle(crewName) {
      if (!this.blueprints || !this.blueprints.crew) return crewName;
      const crew = this.blueprints.crew.find(c => c.name === crewName);
      return crew?.title || crewName;
    },
    getCrewDesc(crewName) {
      if (!this.blueprints || !this.blueprints.crew) return '';
      const crew = this.blueprints.crew.find(c => c.name === crewName);
      return crew?.desc || '';
    },
    getCrewCost(crewName) {
      if (!this.blueprints || !this.blueprints.crew) return '-';
      const crew = this.blueprints.crew.find(c => c.name === crewName);
      return crew?.cost ?? '-';
    },
    getCrewPowers(crewName) {
      if (!this.blueprints || !this.blueprints.crew) return [];
      const crew = this.blueprints.crew.find(c => c.name === crewName);
      return crew?.powerList || [];
    },
    
    // Augment helpers
    getAugmentTitle(augmentName) {
      if (!this.blueprints || !this.blueprints.augments) return augmentName;
      const augment = this.blueprints.augments.find(a => a.Name === augmentName);
      return augment?.Title || augmentName;
    },
    getAugmentDesc(augmentName) {
      if (!this.blueprints || !this.blueprints.augments) return '';
      const augment = this.blueprints.augments.find(a => a.Name === augmentName);
      return augment?.desc || '';
    },
    getAugmentCost(augmentName) {
      if (!this.blueprints || !this.blueprints.augments) return '-';
      const augment = this.blueprints.augments.find(a => a.Name === augmentName);
      return augment?.cost ?? '-';
    },
    getAugmentStackable(augmentName) {
      if (!this.blueprints || !this.blueprints.augments) return '-';
      const augment = this.blueprints.augments.find(a => a.Name === augmentName);
      if (augment?.stackable === true) return 'Yes';
      if (augment?.stackable === false) return 'No';
      return '-';
    },
    
    // Drone helpers
    getDroneTitle(droneName) {
      if (!this.blueprints || !this.blueprints.drones) return droneName;
      const drone = this.blueprints.drones.find(d => d.Name === droneName);
      return drone?.Title || droneName;
    },
    getDroneType(droneName) {
      if (!this.blueprints || !this.blueprints.drones) return '-';
      const drone = this.blueprints.drones.find(d => d.Name === droneName);
      return drone?.type || '-';
    },
    getDroneDesc(droneName) {
      if (!this.blueprints || !this.blueprints.drones) return '';
      const drone = this.blueprints.drones.find(d => d.Name === droneName);
      return drone?.desc || '';
    },
    getDronePower(droneName) {
      if (!this.blueprints || !this.blueprints.drones) return '-';
      const drone = this.blueprints.drones.find(d => d.Name === droneName);
      return drone?.power ?? '-';
    },
    getDroneCost(droneName) {
      if (!this.blueprints || !this.blueprints.drones) return '-';
      const drone = this.blueprints.drones.find(d => d.Name === droneName);
      return drone?.Cost ?? '-';
    },
    selectSector(sector) {
      this.selectedSector = sector;
    },
    toggleHideCommon() {
      this.hideCommonItems = !this.hideCommonItems;
    }
  },
  provide() {
    return {
      // Weapon methods
      getWeaponTitle: this.getWeaponTitle,
      getWeaponType: this.getWeaponType,
      getWeaponDesc: this.getWeaponDesc,
      getWeaponDamage: this.getWeaponDamage,
      getWeaponShots: this.getWeaponShots,
      getWeaponPower: this.getWeaponPower,
      getWeaponCooldown: this.getWeaponCooldown,
      getWeaponCost: this.getWeaponCost,
      // Crew methods
      getCrewTitle: this.getCrewTitle,
      getCrewDesc: this.getCrewDesc,
      getCrewCost: this.getCrewCost,
      getCrewPowers: this.getCrewPowers,
      // Augment methods
      getAugmentTitle: this.getAugmentTitle,
      getAugmentDesc: this.getAugmentDesc,
      getAugmentCost: this.getAugmentCost,
      getAugmentStackable: this.getAugmentStackable,
      // Drone methods
      getDroneTitle: this.getDroneTitle,
      getDroneType: this.getDroneType,
      getDroneDesc: this.getDroneDesc,
      getDronePower: this.getDronePower,
      getDroneCost: this.getDroneCost
    };
  },
  mounted() {
    this.loadSectors();
  }
});

app.component('event-tree', EventTree);
app.component('app-header', AppHeader);
app.component('sector-navigation', SectorNavigation);
app.component('sector-overview', SectorOverview);
app.component('sector-detail', SectorDetail);

app.mount('#app');
