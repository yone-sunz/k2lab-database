(async () => {
	const pages = [];
	let followingId = null;
	do {
		const param = followingId === null ? '' : `?followingId=${followingId}`; //
		const res = await fetch(
			`https://scrapbox.io/api/pages/${scrapbox.Project.name}/search/titles${param}`
		);
		followingId = res.headers.get('X-Following-Id');
		pages.push(...(await res.json()));
	} while (followingId);

	const pageId = Object.fromEntries(pages.map((p, i) => [p.title, i]));
	const edges = [];
	for (const p of pages) {
		for (const l of p.links) {
			if (pageId[l] === undefined) {
				pageId[l] = Object.keys(pageId).length;
			}
			edges.push(`<edge id="${edges.length}" source="${pageId[p.title]}" target="${pageId[l]}"/>`);
		}
	}
	const escape = s => s.replace(/"/g, '&quot;').replace(/&/g, '&amp;');
	const nodes = Object.entries(pageId).map(([t, i]) => `<node id="${i}" label="${escape(t)}"><attvalues><attvalue for="0" value="https://scrapbox.io/${scrapbox.Project.name}/${escape(t)}" /></attvalues></node>`); //url="https://scrapbox.io/${scrapbox.Project.name}/${t}"
	//↑ここでデータを入れてるっぽい
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
 <gexf xmlns="http://www.gexf.net/1.2draft"
 	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 	xsi:schemaLocation="http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd"
 	version="1.2">
 	<graph defaultedgetype="directed">
	 <attributes class="node">
	 <attribute id="0" title="url" type="string">
	 </attribute>
	 </attributes>
 		<nodes>
 			${nodes.join('\n')}
 		</nodes>
 		<edges>
 			${edges.join('\n')}
 		</edges>
 	</graph>
 </gexf>`;

	const uri = 'data:application/x-octet-stream;,' + window.encodeURIComponent(xml);
	$(`<a href="${uri}" download="${scrapbox.Project.name}.gexf"/>`)[0].click();
})();