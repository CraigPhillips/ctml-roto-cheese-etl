var draftAnalysisTemplate = "cheese.draft-analysis";

dust.loadSource(dust.compile('\
	<div id="cheese-keeper-analysis">\
		<ul>\
			<li class="header">\
				<div class="player-name">Player Name</div>\
				<div class="player-pick">Pick Cost</div>\
				<div class="player-projected">Projected</div>\
				<div class="player-value">Value</div>\
				<div class="manager">Manager</div>\
			</li>\
			{#.}\
				<li>\
					<div class="player-name">\
						<a href="{playerData.playerDetailsPath}" target="_blank">\
							{playerData.name}\
						</a>\
					</div>\
					<div class="player-pick">{potentialKeeperPick}</div>\
					<div class="player-projected">{defaultDraftPick}</div>\
					<div class="player-value">{keeperDiscount}</div>\
					<div class="manager">\
						<a href="{teamData.teamPageUrl}" target="_blank">\
							{teamData.name}\
						</a>\
					</div>\
				</li>\
			{/.}\
		</ul>\
	</div>\
	', draftAnalysisTemplate));
