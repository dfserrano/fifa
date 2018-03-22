# -*- coding: utf-8 -*-
"""
Created on Mon Mar 19 16:14:42 2018

@author: dfserrano
"""

import csv
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn import manifold
import pandas as pd

TEAMS = ['Argentina', 'Australia', 'Belgium', 'Brazil', 'Colombia', 'Costa Rica',
         'Croatia', 'Denmark', 'Egypt', 'England', 'France', 'Germany', 'Iceland',
         'Iran', 'Japan', 'Mexico', 'Morocco', 'Nigeria', 'Panama', 'Peru', 'Poland',
         'Portugal', 'Russia', 'Saudi Arabia', 'Senegal', 'Senegal', 'Serbia', 
         'Korea Republic', 'Spain', 'Sweden', 'Switzerland', 'Tunisia', 'Uruguay']

# LW (left winger), RW (right winger), ST (striker), CF (center forwards)
ATTACKER_POSITIONS = ['LW', 'RW', 'ST', 'CF']
DEFENDER_POSITIONS = ['CB', 'LCB', 'RCB']
FULLBACK_POSITIONS = ['LB', 'RB']
MIDFIELDER_POSITIONS = ['CM', 'LDM', 'RDM', 'CDM', 'CAM', 'LM', 'RM']
GOALKEEPER_POSITIONS = ['GK']

POSITIONS = GOALKEEPER_POSITIONS
OUTPUT_FILE = "goalkeepers.json"
PLAYERS_PER_TEAM = 2

def loadPlayers(filepath, teams, positions, players_per_team):
    
    teamCounters = {}
    players = []
    with open(filepath, 'rb') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',')
        i = 0    
        for row in spamreader:
            i = i+1
            
            preferredPositions = row[63]
            nationality = row[4]
            
            if any(team in nationality for team in teams):
                if any(pos in preferredPositions for pos in positions):
                    # clean currency                
                    row[10] = row[10][3:-1]
                    row[11] = row[11][3:-1]
                    
                    if (len(row[10]) == 0): row[10] = 0
                    if (len(row[11]) == 0): row[11] = 0
                    
                    if nationality in teamCounters:                        
                        if teamCounters[nationality] >= players_per_team:
                            continue
                        
                        teamCounters[nationality] += 1
                    else:
                        teamCounters[nationality] = 1
                        
                    players.append(row)
    
    return players

players = loadPlayers('/home/dfserrano/Projects/sandbox/fifa/CompleteDataset.csv', TEAMS, POSITIONS, PLAYERS_PER_TEAM)

# Extract profile
profileLabels = ['name', 'age', 'photo', 'nationality', 'flag', 'overall', 'potential', 'club', 'club_logo', 'value', 'wage'];
profile = [player[1:12] for player in players]
profile = pd.DataFrame.from_records(profile, columns=profileLabels)


# Extract data without profile info
X = [player[10:47] for player in players]
for i, player in enumerate(X):
    X[i] = [eval(str(val)) for val in player]

# Standardizing the features
#X = MinMaxScaler(feature_range=(0,1), copy=False).fit_transform(X)
X = StandardScaler().fit_transform(X)

# Reduce to 2 dimensions with PCA
pca = PCA(n_components=2).fit_transform(X)

# Reduce to 2 dimensions with TNSE
#tsne = manifold.TSNE(n_components=2, init='pca').fit_transform(X)

labels = ['y', 'x'];
coords = pd.DataFrame.from_records(pca, columns=labels)
#coords = pd.DataFrame.from_records(tsne, columns=labels)

# Mirror plot
xMax = coords['x'].max()
yMax = coords['y'].max()
xMin = coords['x'].min()
yMin = coords['y'].min()
xMid = (xMax - xMin) / 2
yMid = (yMax - yMin) / 2
coords['x'] = xMid + (xMid - coords['x'])
#coords['y'] = yMid + (yMid - coords['y'])

# Transform to move to 0,0
xMin = coords['x'].min()
yMin = coords['y'].min()
coords['x'] += xMin * -1
coords['y'] += yMin * -1

# Plot
coords.plot.scatter(x='x', y='y');

# Concatenate coordinates and profile
data = pd.concat([profile, coords], axis = 1)

# Export to JSON
data.to_json(OUTPUT_FILE, orient='records')