<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	// ─── State ──────────────────────────────────────────────────────────────
	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let countryCode = $state('+91');
	let education = $state('');
	let skills = $state('');
	let experience = $state('');
	let resumes: any[] = $state([]);
	let isLoadingResumes = $state(false);
	let isSaving = $state(false);
	let saveStatus = $state<'idle' | 'success' | 'error'>('idle');
	let activeTab = $state<'form' | 'saved' | 'dashboard'>('form');
	let editingId = $state<string | null>(null);
	let isDownloading = $state(false);

	// ─── Dashboard state ─────────────────────────────────────────────────
	let dashFilter = $state<'all' | 'active' | 'completed' | 'inactive' | 'deleted'>('all');
	let dashSearch = $state('');
	let dashSort = $state<'name' | 'status' | 'strength'>('name');
	let dashPage = $state(1);
	const DASH_PER_PAGE = 6;

	// ─── Persistent stores ───────────────────────────────────────────────
	let skillSuggestions: string[] = [];
	let countryCodes: { code: string; label: string }[] = [];

	// ─── Load on mount ────────────────────────────────────────────────────
	onMount(() => {
		const savedSkills = localStorage.getItem('resume_skills');
		skillSuggestions = savedSkills ? JSON.parse(savedSkills) : [
			'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust',
			'React', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Express', 'Django', 'Flask',
			'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
			'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD',
			'Git', 'Agile', 'Scrum', 'TDD', 'REST', 'GraphQL',
			'HTML', 'CSS', 'SCSS', 'Tailwind', 'Bootstrap',
			'Data Science', 'Machine Learning', 'AI', 'NLP', 'Computer Vision',
		];
		if (!savedSkills) localStorage.setItem('resume_skills', JSON.stringify(skillSuggestions));

		const savedCodes = localStorage.getItem('resume_country_codes');
		countryCodes = savedCodes ? JSON.parse(savedCodes) : [
			{ code: '+1',   label: '🇺🇸 +1 US/CA' },
			{ code: '+44',  label: '🇬🇧 +44 UK' },
			{ code: '+91',  label: '🇮🇳 +91 India' },
			{ code: '+61',  label: '🇦🇺 +61 Australia' },
			{ code: '+81',  label: '🇯🇵 +81 Japan' },
			{ code: '+86',  label: '🇨🇳 +86 China' },
			{ code: '+49',  label: '🇩🇪 +49 Germany' },
			{ code: '+33',  label: '🇫🇷 +33 France' },
			{ code: '+55',  label: '🇧🇷 +55 Brazil' },
			{ code: '+971', label: '🇦🇪 +971 UAE' },
			{ code: '+65',  label: '🇸🇬 +65 Singapore' },
		];
		if (!savedCodes) localStorage.setItem('resume_country_codes', JSON.stringify(countryCodes));
	});

	// ─── Skill helpers ────────────────────────────────────────────────────
	function addCustomSkill(skill: string) {
		const t = skill.trim();
		if (!t || skillSuggestions.some(s => s.toLowerCase() === t.toLowerCase())) return;
		skillSuggestions = [...skillSuggestions, t];
		localStorage.setItem('resume_skills', JSON.stringify(skillSuggestions));
	}

	function addCustomCountryCode(code: string) {
		const t = code.trim();
		if (!t || countryCodes.some(c => c.code === t)) return;
		countryCodes = [...countryCodes, { code: t, label: `🌍 ${t} Custom` }];
		localStorage.setItem('resume_country_codes', JSON.stringify(countryCodes));
		countryCode = t;
	}

	// ─── Strength ─────────────────────────────────────────────────────────
	const strength = $derived.by(() => {
		const filled = [name, email, phone, education, skills, experience]
			.filter(v => v?.trim()).length;
		return Math.round((filled / 6) * 100);
	});

	const strengthLabel = $derived.by(() => {
		if (strength === 0) return 'Empty';
		if (strength < 34) return 'Weak';
		if (strength < 67) return 'Good';
		if (strength < 100) return 'Strong';
		return 'Complete';
	});

	const strengthColor = $derived.by(() => {
		if (strength < 34) return '#ef4444';
		if (strength < 67) return '#f59e0b';
		if (strength < 100) return '#3b82f6';
		return '#10b981';
	});

	// ─── Parsed skill tags ────────────────────────────────────────────────
	const skillTags = $derived(
		skills ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []
	);

	// ─── Resume status helper ─────────────────────────────────────────────
	function getResumeStatus(r: any): 'completed' | 'active' | 'inactive' | 'deleted' {
		if (r.deleted) return 'deleted';
		const filled = [r.name, r.email, r.phone, r.education, r.skills, r.experience]
			.filter((v: any) => v?.trim()).length;
		const str = Math.round((filled / 6) * 100);
		if (str === 100) return 'completed';
		if (str >= 33) return 'active';
		return 'inactive';
	}

	function getResumeStrength(r: any): number {
		const filled = [r.name, r.email, r.phone, r.education, r.skills, r.experience]
			.filter((v: any) => v?.trim()).length;
		return Math.round((filled / 6) * 100);
	}

	// ─── Dashboard derived stats ──────────────────────────────────────────
	const dashStats = $derived.by(() => {
		const total     = resumes.length;
		const completed = resumes.filter(r => getResumeStatus(r) === 'completed').length;
		const active    = resumes.filter(r => getResumeStatus(r) === 'active').length;
		const inactive  = resumes.filter(r => getResumeStatus(r) === 'inactive').length;
		const deleted   = resumes.filter(r => getResumeStatus(r) === 'deleted').length;
		return { total, completed, active, inactive, deleted };
	});

	const dashFiltered = $derived.by(() => {
		let rows = resumes.filter(r =>
			dashFilter === 'all' || getResumeStatus(r) === dashFilter
		);
		if (dashSearch.trim()) {
			const q = dashSearch.toLowerCase();
			rows = rows.filter(r =>
				(r.name || '').toLowerCase().includes(q) ||
				(r.email || '').toLowerCase().includes(q)
			);
		}
		rows = [...rows].sort((a, b) => {
			if (dashSort === 'status') return getResumeStatus(a).localeCompare(getResumeStatus(b));
			if (dashSort === 'strength') return getResumeStrength(b) - getResumeStrength(a);
			return (a.name || '').localeCompare(b.name || '');
		});
		return rows;
	});

	const dashTotalPages = $derived(Math.max(1, Math.ceil(dashFiltered.length / DASH_PER_PAGE)));
	const dashPageRows   = $derived(dashFiltered.slice((dashPage - 1) * DASH_PER_PAGE, dashPage * DASH_PER_PAGE));

	// ─── Save / Load / Delete ─────────────────────────────────────────────
	async function saveResume() {
		isSaving = true;
		saveStatus = 'idle';
		try {
			const method = editingId ? 'PUT' : 'POST';
			const url = editingId ? `/api/resume/${editingId}` : '/api/resume';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name, email,
					phone: countryCode + phone,
					education, skills, experience
				})
			});
			if (res.ok) {
				saveStatus = 'success';
				editingId = null;
				setTimeout(() => (saveStatus = 'idle'), 3000);
			} else {
				saveStatus = 'error';
			}
		} catch {
			saveStatus = 'error';
		} finally {
			isSaving = false;
		}
	}

	async function loadResumes() {
		isLoadingResumes = true;
		try {
			const res = await fetch('/api/resume');
			if (res.ok) resumes = await res.json();
		} catch {
			// silently fail
		} finally {
			isLoadingResumes = false;
		}
	}

	async function openSaved() {
		await loadResumes();
		activeTab = 'saved';
	}

	async function openDashboard() {
		await loadResumes();
		dashPage = 1;
		dashFilter = 'all';
		dashSearch = '';
		activeTab = 'dashboard';
	}

	async function deleteResume(id: string) {
		if (!confirm('Delete this resume?')) return;
		await fetch(`/api/resume/${id}`, { method: 'DELETE' });
		resumes = resumes.filter((r: any) => r.id !== id);
	}

	function editResume(r: any) {
		name = r.name || '';
		email = r.email || '';
		const ph = r.phone || '';
		const cc = countryCodes.find((c: any) => ph.startsWith(c.code));
		countryCode = cc?.code || '+91';
		phone = cc ? ph.slice(cc.code.length) : ph;
		education = r.education || '';
		skills = r.skills || '';
		experience = r.experience || '';
		editingId = r.id;
		activeTab = 'form';
	}

	function resetForm() {
		name = email = phone = education = skills = experience = '';
		countryCode = '+91';
		editingId = null;
		saveStatus = 'idle';
	}

	const initial = $derived(name ? name.charAt(0).toUpperCase() : '?');

	// ─── PDF Download ─────────────────────────────────────────────────────
	async function downloadPDF(data?: {
		name: string; email: string; phone: string;
		education: string; skills: string; experience: string;
	}) {
		const d = data ?? { name, email, phone: countryCode + phone, education, skills, experience };
		isDownloading = true;
		try {
			const { default: jsPDF } = await import('jspdf');
			const doc = new jsPDF({ unit: 'mm', format: 'a4' });
			const PW  = doc.internal.pageSize.getWidth();
			const PH  = doc.internal.pageSize.getHeight();
			const ML  = 20, MR = 20, CW = PW - ML - MR, LH = 5.5;
			const INK:    [number,number,number] = [17,  24,  39];
			const MUTED:  [number,number,number] = [75,  85,  99];
			const ACCENT: [number,number,number] = [30,  64, 175];
			const RULE:   [number,number,number] = [209, 213, 219];
			const WHITE:  [number,number,number] = [255, 255, 255];
			const HEADBG: [number,number,number] = [17,  24,  39];
			let y = 0;

			function wrapText(text: string, x: number, startY: number, maxW: number, lh: number): number {
				const lines: string[] = doc.splitTextToSize(text, maxW);
				lines.forEach((ln: string) => { doc.text(ln, x, startY); startY += lh; });
				return startY;
			}

			function experienceBlock(raw: string, x: number, startY: number, maxW: number): number {
				const lines = raw.split('\n').map((l: string) => l.trim()).filter(Boolean);
				lines.forEach((ln: string) => {
					const isBullet = ln.startsWith('-') || ln.startsWith('•') || ln.startsWith('*');
					const text = isBullet ? ln.replace(/^[-•*]\s*/, '') : ln;
					const bulletX = x + 4, textW = maxW - 4;
					doc.setFillColor(...MUTED);
					doc.circle(x + 1.2, startY - 1.2, 0.8, 'F');
					const wrapped: string[] = doc.splitTextToSize(text, textW);
					wrapped.forEach((wl: string) => { doc.text(wl, bulletX, startY); startY += LH; });
					startY += 1;
				});
				return startY;
			}

			const headerH = 42;
			doc.setFillColor(...HEADBG);
			doc.rect(0, 0, PW, headerH, 'F');
			doc.setFillColor(...ACCENT);
			doc.rect(0, 0, PW, 2, 'F');
			y = 14;
			doc.setFont('helvetica', 'bold');
			doc.setFontSize(26);
			doc.setTextColor(...WHITE);
			doc.text((d.name || 'Your Name').toUpperCase(), ML, y);
			y += 8;
			doc.setFont('helvetica', 'normal');
			doc.setFontSize(9);
			doc.setTextColor(156, 163, 175);
			doc.text('Professional Resume', ML, y);
			const contactY = 10;
			let cx = PW - MR;
			function contactItem(icon: string, val: string) {
				if (!val) return;
				doc.setFont('helvetica', 'normal');
				doc.setFontSize(8);
				doc.setTextColor(209, 213, 219);
				const tw = doc.getStringUnitWidth(val) * 8 / doc.internal.scaleFactor;
				doc.text(val, cx - tw, contactY + 8);
				doc.setTextColor(156, 163, 175);
				doc.setFontSize(7);
				const iw = doc.getStringUnitWidth(icon) * 7 / doc.internal.scaleFactor;
				doc.text(icon, cx - tw - iw - 1.5, contactY + 8);
				cx = cx - tw - iw - 8;
			}
			contactItem('✉', d.email);
			contactItem('☎', d.phone);
			y = headerH + 10;

			function sectionHead(label: string) {
				doc.setFont('helvetica', 'bold');
				doc.setFontSize(8);
				doc.setTextColor(...ACCENT);
				doc.text(label, ML, y);
				y += 3;
				doc.setDrawColor(...RULE);
				doc.setLineWidth(0.3);
				doc.line(ML, y, PW - MR, y);
				y += 5;
			}

			const skillList = d.skills ? d.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
			if (skillList.length > 0) {
				sectionHead('PROFESSIONAL SUMMARY');
				doc.setFont('helvetica', 'normal');
				doc.setFontSize(9.5);
				doc.setTextColor(...INK);
				const summary = skillList.length > 2
					? `Skilled professional with expertise in ${skillList.slice(0, -1).join(', ')} and ${skillList[skillList.length - 1]}. Committed to delivering high-quality results and continuously expanding technical knowledge.`
					: `Skilled professional with expertise in ${skillList.join(' and ')}. Committed to delivering high-quality results.`;
				y = wrapText(summary, ML, y, CW, LH);
				y += 6;
			}
			if (d.experience) {
				sectionHead('PROFESSIONAL EXPERIENCE');
				doc.setFont('helvetica', 'normal');
				doc.setFontSize(9.5);
				doc.setTextColor(...INK);
				y = experienceBlock(d.experience, ML, y, CW);
				y += 6;
			}
			if (d.education) {
				sectionHead('EDUCATION');
				const eduLines = d.education.split('\n').map((l: string) => l.trim()).filter(Boolean);
				eduLines.forEach((line: string) => {
					const parts = line.split('—').map((p: string) => p.trim());
					if (parts.length >= 2) {
						doc.setFont('helvetica', 'bold');
						doc.setFontSize(9.5);
						doc.setTextColor(...INK);
						doc.text(parts[0], ML, y);
						doc.setFont('helvetica', 'normal');
						doc.setFontSize(9);
						doc.setTextColor(...MUTED);
						const dateW = doc.getStringUnitWidth(parts[1]) * 9 / doc.internal.scaleFactor;
						doc.text(parts[1], PW - MR - dateW, y);
						y += LH;
						if (parts[2]) { doc.setTextColor(...MUTED); y = wrapText(parts[2], ML, y, CW, LH - 0.5); }
					} else {
						doc.setFont('helvetica', 'bold');
						doc.setFontSize(9.5);
						doc.setTextColor(...INK);
						y = wrapText(line, ML, y, CW, LH);
					}
					y += 4;
				});
				y += 2;
			}
			if (skillList.length > 0) {
				sectionHead('SKILLS & TECHNOLOGIES');
				const pillH = 6, pillPad = 3.5, pillGap = 3, rowGap = 3.5;
				let px = ML;
				skillList.forEach((tag: string) => {
					doc.setFontSize(8);
					doc.setFont('helvetica', 'normal');
					const tw = doc.getStringUnitWidth(tag) * 8 / doc.internal.scaleFactor;
					const pillW = tw + pillPad * 2;
					if (px + pillW > PW - MR) { px = ML; y += pillH + rowGap; }
					doc.setFillColor(239, 246, 255);
					doc.setDrawColor(...ACCENT);
					doc.setLineWidth(0.25);
					doc.roundedRect(px, y - pillH + 1.5, pillW, pillH, 1.5, 1.5, 'FD');
					doc.setTextColor(...ACCENT);
					doc.text(tag, px + pillPad, y);
					px += pillW + pillGap;
				});
				y += pillH + 8;
			}
			doc.setDrawColor(...RULE);
			doc.setLineWidth(0.3);
			doc.line(ML, PH - 12, PW - MR, PH - 12);
			doc.setFont('helvetica', 'normal');
			doc.setFontSize(7);
			doc.setTextColor(...MUTED);
			doc.text(d.name ? `${d.name} · Resume` : 'Resume', ML, PH - 7);
			const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
			doc.text(dateStr, PW - MR, PH - 7, { align: 'right' });
			const filename = (d.name || 'resume').toLowerCase().replace(/\s+/g, '-') + '-resume.pdf';
			doc.save(filename);
		} catch (err) {
			console.error('PDF generation failed:', err);
			alert('Could not generate PDF. Ensure jspdf is installed:\nnpm install jspdf');
		} finally {
			isDownloading = false;
		}
	}
</script>

<div class="app">

	<!-- ─── Header ─────────────────────────────────────────────────────── -->
	<header class="header">
		<div class="header-brand">
			<div class="logo">R</div>
			<div>
				<span class="brand-name">Resume<span class="brand-accent"> Builder</span></span>
				<p class="brand-sub">Craft your professional story</p>
			</div>
		</div>

		<div class="header-actions">
			{#if editingId}
				<span class="editing-badge">
					<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
					Editing
				</span>
			{/if}
			<button class="btn-ghost" onclick={resetForm} title="Start a new resume">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
				New
			</button>
			<button
	class="btn-ghost"
	onclick={() => goto('/dashboard')}
>
	<svg width="14" height="14" viewBox="0 0 24 24"
		fill="none" stroke="currentColor" stroke-width="2">
		<path d="M15 18l-6-6 6-6"/>
	</svg>
	Dashboard
</button>
			<div class="avatar" title={name || 'No name yet'}>{initial}</div>
		</div>
	</header>

	<!-- ─── Tab nav ───────────────────────────────────────────────────── -->
	<nav class="tab-bar">
		<button class="tab" class:active={activeTab === 'form'} onclick={() => (activeTab = 'form')}>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
			{editingId ? 'Edit Resume' : 'Build Resume'}
		</button>
		<button class="tab" class:active={activeTab === 'saved'} onclick={openSaved}>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
			Saved Resumes
			{#if resumes.length > 0}
				<span class="tab-pill">{resumes.length}</span>
			{/if}
		</button>
		<button class="tab tab-dashboard" class:active={activeTab === 'dashboard'} onclick={openDashboard}>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
			Dashboard
			{#if activeTab !== 'dashboard' && resumes.length > 0}
				<span class="tab-pill dash-pill">{resumes.length}</span>
			{/if}
		</button>
	</nav>

	<!-- ─── Main ──────────────────────────────────────────────────────── -->
	<main class="main">

		<!-- ══ BUILD TAB ═══════════════════════════════════════════════ -->
		{#if activeTab === 'form'}
		<div class="grid-two">
			<div class="form-col">
				<div class="card">
					<div class="strength-row">
						<span class="strength-label">Profile strength</span>
						<span class="strength-badge" style="color:{strengthColor}; background:{strengthColor}18; border-color:{strengthColor}40">
							{strengthLabel} · {strength}%
						</span>
					</div>
					<div class="strength-track">
						<div class="strength-fill" style="width:{strength}%; background:{strengthColor}"></div>
					</div>
					<div class="checklist">
						{#each [['Name', name], ['Email', email], ['Phone', phone], ['Education', education], ['Skills', skills], ['Experience', experience]] as [lbl, val]}
							<span class="check-chip" class:done={!!val?.trim()}>
								{#if val?.trim()}
									<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
								{:else}
									<span class="check-circle"></span>
								{/if}
								{lbl}
							</span>
						{/each}
					</div>
				</div>

				<div class="card">
					<h2 class="section-head">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
						Personal details
					</h2>
					<div class="fields">
						<div class="field">
							<label class="flabel">Full name</label>
							<input bind:value={name} placeholder="e.g. Priya Sharma" class="inp" />
						</div>
						<div class="field">
							<label class="flabel">Email address</label>
							<input bind:value={email} type="email" placeholder="priya@example.com" class="inp" />
						</div>
						<div class="field">
							<label class="flabel">Phone number</label>
							<div class="phone-row">
								<input list="country-codes" bind:value={countryCode} placeholder="+91" onblur={() => addCustomCountryCode(countryCode)} class="inp code-inp" />
								<datalist id="country-codes">
									{#each countryCodes as c}<option value={c.code}>{c.label}</option>{/each}
								</datalist>
								<input bind:value={phone} type="tel" placeholder="98765 43210" class="inp" style="flex:1" />
							</div>
						</div>
					</div>
				</div>

				<div class="card">
					<h2 class="section-head">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
						Education
					</h2>
					<div class="fields">
						<textarea bind:value={education} rows="3" placeholder="e.g. B.Tech Computer Science, IIT Bombay — 2020–2024" class="inp ta"></textarea>
					</div>
				</div>

				<div class="card">
					<h2 class="section-head">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
						Skills
					</h2>
					<div class="fields">
						<input list="skills-list" bind:value={skills} placeholder="Comma-separated: JavaScript, Python, React…" onblur={() => skills && skills.split(',').forEach((s: string) => addCustomSkill(s))} class="inp" />
						<datalist id="skills-list">
							{#each skillSuggestions as s}<option value={s} />{/each}
						</datalist>
						{#if skillTags.length > 0}
							<div class="tag-row">
								{#each skillTags as tag}<span class="skill-pill">{tag}</span>{/each}
							</div>
						{/if}
					</div>
				</div>

				<div class="card">
					<h2 class="section-head">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
						Experience
					</h2>
					<div class="fields">
						<textarea bind:value={experience} rows="4" placeholder={"e.g. Software Engineer at Infosys — Jan 2022 to Present\nBuilt microservices handling 10M+ daily requests."} class="inp ta"></textarea>
					</div>
				</div>

				<div class="action-group">
					<button class="btn-save" onclick={saveResume} disabled={isSaving || strength === 0}>
						{#if isSaving}
							<span class="spin"></span> Saving…
						{:else if saveStatus === 'success'}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
							Saved!
						{:else if saveStatus === 'error'}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
							Try again
						{:else}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
							{editingId ? 'Update resume' : 'Save resume'}
						{/if}
					</button>
					<button class="btn-pdf" onclick={() => downloadPDF()} disabled={isDownloading || strength === 0} title="Download as PDF">
						{#if isDownloading}
							<span class="spin dark"></span> Generating…
						{:else}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
							Download PDF
						{/if}
					</button>
				</div>
			</div>

			<div class="preview-col">
				<div class="card preview-card">
					<div class="preview-topbar">
						<div class="live-indicator">
							<span class="live-dot"></span>
							<span class="live-text">Live preview</span>
						</div>
						<button class="btn-preview-pdf" onclick={() => downloadPDF()} disabled={isDownloading || strength === 0} title="Download PDF">
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
							PDF
						</button>
					</div>
					<div class="pv-profile">
						<div class="pv-avatar">{initial}</div>
						<div>
							<h3 class="pv-name">{name || 'Your Name'}</h3>
							<p class="pv-detail">{email || 'email@example.com'}</p>
							<p class="pv-detail">{countryCode}{phone || '98765 43210'}</p>
						</div>
					</div>
					<div class="pv-sections">
						<div class="pv-sec">
							<div class="pv-sec-title">Education</div>
							<p class="pv-text">{education || '—'}</p>
						</div>
						<div class="pv-sec">
							<div class="pv-sec-title">Skills</div>
							{#if skillTags.length > 0}
								<div class="pv-tags">{#each skillTags as tag}<span class="pv-tag">{tag}</span>{/each}</div>
							{:else}
								<p class="pv-text faint">—</p>
							{/if}
						</div>
						<div class="pv-sec">
							<div class="pv-sec-title">Experience</div>
							<p class="pv-text">{experience || '—'}</p>
						</div>
					</div>
					{#if !name && !email && !phone && !education && !skills && !experience}
						<div class="pv-empty">
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/></svg>
							<p>Fill in the form to see your resume</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- ══ SAVED TAB ════════════════════════════════════════════════ -->
		{:else if activeTab === 'saved'}
		<div class="saved-view">
			<div class="saved-bar">
				<div>
					<h2 class="saved-title">Saved resumes</h2>
					{#if resumes.length > 0}
						<p class="saved-sub">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} found</p>
					{/if}
				</div>
				<button class="btn-refresh" onclick={openSaved} disabled={isLoadingResumes}>
					{#if isLoadingResumes}
						<span class="spin dark"></span> Refreshing…
					{:else}
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
						Refresh
					{/if}
				</button>
			</div>

			{#if isLoadingResumes}
				<div class="state-center">
					<span class="spin dark lg"></span>
					<p class="state-text">Loading your resumes…</p>
				</div>
			{:else if resumes.length === 0}
				<div class="state-center">
					<div class="empty-icon-wrap">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
					</div>
					<p class="state-title">No saved resumes yet</p>
					<p class="state-sub">Build your first resume and save it — it will appear here.</p>
					<button class="btn-primary-sm" onclick={() => (activeTab = 'form')}>
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
						Start building
					</button>
				</div>
			{:else}
				<div class="resume-grid">
					{#each resumes as r}
						<div class="resume-card">
							<div class="rc-top">
								<div class="rc-avatar">{r.name ? r.name.charAt(0).toUpperCase() : '?'}</div>
								<div class="rc-info">
									<p class="rc-name">{r.name || '—'}</p>
									<p class="rc-email">{r.email || '—'}</p>
								</div>
							</div>
							{#if r.skills}
								<div class="rc-skills">
									{#each r.skills.split(',').slice(0, 4).map((s: string) => s.trim()).filter(Boolean) as tag}
										<span class="pv-tag sm">{tag}</span>
									{/each}
									{#if r.skills.split(',').length > 4}
										<span class="rc-more">+{r.skills.split(',').length - 4} more</span>
									{/if}
								</div>
							{/if}
							<div class="rc-actions">
								<button class="btn-rc edit" onclick={() => editResume(r)}>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
									Edit
								</button>
								<button class="btn-rc pdf" onclick={() => downloadPDF({ name: r.name, email: r.email, phone: r.phone, education: r.education, skills: r.skills, experience: r.experience })} disabled={isDownloading}>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
									PDF
								</button>
								<button class="btn-rc del" onclick={() => deleteResume(r.id)}>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
									Delete
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- ══ DASHBOARD TAB ════════════════════════════════════════════ -->
		{:else if activeTab === 'dashboard'}
		<div class="dash-view">

			<!-- Top bar -->
			<div class="dash-topbar">
				<div>
					<h2 class="dash-heading">Dashboard</h2>
					<p class="dash-subhead">
						{#if dashFilter === 'all'}Showing all resumes{:else}Showing {dashFilter} resumes{/if}
					</p>
				</div>
				<button class="btn-refresh" onclick={openDashboard} disabled={isLoadingResumes}>
					{#if isLoadingResumes}
						<span class="spin dark"></span> Refreshing…
					{:else}
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
						Refresh
					{/if}
				</button>
			</div>

			<!-- ── Stat cards ─────────────────────────────────────────── -->
			<div class="dash-stats">
				{#each [
					{ key: 'all',       label: 'Total',     count: dashStats.total,     accent: '#6366f1', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', sub: 'all resumes' },
					{ key: 'active',    label: 'Active',    count: dashStats.active,    accent: '#10b981', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', sub: 'in progress' },
					{ key: 'completed', label: 'Completed', count: dashStats.completed, accent: '#f59e0b', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', sub: 'fully filled' },
					{ key: 'inactive',  label: 'Inactive',  count: dashStats.inactive,  accent: '#94a3b8', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', sub: 'incomplete' },
					{ key: 'deleted',   label: 'Deleted',   count: dashStats.deleted,   accent: '#ef4444', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', sub: 'soft-deleted' },
				] as sc}
					<button
						class="dash-stat-card"
						class:active={dashFilter === sc.key}
						onclick={() => { dashFilter = sc.key as any; dashPage = 1; }}
						style="--accent:{sc.accent}"
					>
						<div class="dsc-icon" style="background:{sc.accent}18; color:{sc.accent}">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d={sc.icon}/></svg>
						</div>
						<div class="dsc-body">
							<span class="dsc-label">{sc.label}</span>
							<span class="dsc-num">{sc.count}</span>
							<span class="dsc-sub">{sc.sub}</span>
						</div>
						<div class="dsc-bar">
							<div class="dsc-fill"
								style="width:{dashStats.total > 0 ? Math.round((sc.count / dashStats.total) * 100) : 0}%; background:{sc.accent}">
							</div>
						</div>
					</button>
				{/each}
			</div>

			<!-- ── Mini charts row ───────────────────────────────────── -->
			<div class="dash-charts">
				<!-- Skills breakdown -->
				<div class="chart-card">
					<div class="chart-title">
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
						Section completion
					</div>
					{#each [
						{ lbl: 'Name',       pct: resumes.length ? Math.round(resumes.filter(r => r.name?.trim()).length / resumes.length * 100) : 0,       clr: '#6366f1' },
						{ lbl: 'Email',      pct: resumes.length ? Math.round(resumes.filter(r => r.email?.trim()).length / resumes.length * 100) : 0,      clr: '#3b82f6' },
						{ lbl: 'Phone',      pct: resumes.length ? Math.round(resumes.filter(r => r.phone?.trim()).length / resumes.length * 100) : 0,      clr: '#10b981' },
						{ lbl: 'Education',  pct: resumes.length ? Math.round(resumes.filter(r => r.education?.trim()).length / resumes.length * 100) : 0,  clr: '#f59e0b' },
						{ lbl: 'Skills',     pct: resumes.length ? Math.round(resumes.filter(r => r.skills?.trim()).length / resumes.length * 100) : 0,     clr: '#ef4444' },
						{ lbl: 'Experience', pct: resumes.length ? Math.round(resumes.filter(r => r.experience?.trim()).length / resumes.length * 100) : 0, clr: '#a855f7' },
					] as bar}
						<div class="cbar-row">
							<span class="cbar-lbl">{bar.lbl}</span>
							<div class="cbar-track">
								<div class="cbar-fill" style="width:{bar.pct}%; background:{bar.clr}"></div>
							</div>
							<span class="cbar-val">{bar.pct}%</span>
						</div>
					{/each}
				</div>

				<!-- Donut chart -->
				<div class="chart-card chart-donut-card">
					<div class="chart-title">
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20"/></svg>
						Status breakdown
					</div>
					<div class="donut-wrap">
						<svg width="88" height="88" viewBox="0 0 88 88">
							{#each (() => {
								const total = dashStats.total || 1;
								const slices = [
									{ v: dashStats.active,    c: '#10b981' },
									{ v: dashStats.completed, c: '#f59e0b' },
									{ v: dashStats.inactive,  c: '#94a3b8' },
									{ v: dashStats.deleted,   c: '#ef4444' },
								];
								const r = 34, circ = 2 * Math.PI * r;
								let offset = 0;
								return slices.map(s => {
									const dash = (s.v / total) * circ;
									const gap  = circ - dash;
									const o    = -offset * circ / total;
									offset    += s.v;
									return { dash, gap, o, c: s.c };
								});
							})() as seg}
								<circle cx="44" cy="44" r="34" fill="none"
									stroke={seg.c}
									stroke-width="12"
									stroke-dasharray="{seg.dash} {seg.gap}"
									stroke-dashoffset={seg.o}
									transform="rotate(-90 44 44)"
								/>
							{/each}
							<text x="44" y="47" text-anchor="middle" font-size="16" font-weight="600" fill="currentColor" font-family="inherit">{dashStats.total}</text>
						</svg>
						<div class="donut-legend">
							{#each [
								{ label: 'Active',    color: '#10b981', count: dashStats.active },
								{ label: 'Completed', color: '#f59e0b', count: dashStats.completed },
								{ label: 'Inactive',  color: '#94a3b8', count: dashStats.inactive },
								{ label: 'Deleted',   color: '#ef4444', count: dashStats.deleted },
							] as leg}
								<div class="leg-row">
									<span class="leg-dot" style="background:{leg.color}"></span>
									<span class="leg-label">{leg.label}</span>
									<span class="leg-count">{leg.count}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- ── Search + sort ─────────────────────────────────────── -->
			<div class="dash-search-row">
				<div class="search-wrap">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
					<input bind:value={dashSearch} oninput={() => (dashPage = 1)} placeholder="Search by name or email…" class="dash-search-inp" />
				</div>
				<select bind:value={dashSort} onchange={() => (dashPage = 1)} class="dash-sort-sel">
					<option value="name">Sort: Name A–Z</option>
					<option value="strength">Sort: Strength ↓</option>
					<option value="status">Sort: Status</option>
				</select>
			</div>

			<!-- ── Filter chips ──────────────────────────────────────── -->
			<div class="dash-chips">
				{#each [
					{ key: 'all',       label: 'All',       color: '#6366f1' },
					{ key: 'active',    label: 'Active',    color: '#10b981' },
					{ key: 'completed', label: 'Completed', color: '#f59e0b' },
					{ key: 'inactive',  label: 'Inactive',  color: '#94a3b8' },
					{ key: 'deleted',   label: 'Deleted',   color: '#ef4444' },
				] as chip}
					<button
						class="filter-chip"
						class:active={dashFilter === chip.key}
						onclick={() => { dashFilter = chip.key as any; dashPage = 1; }}
						style="--chip-color:{chip.color}"
					>
						<span class="chip-dot" style="background:{chip.color}"></span>
						{chip.label}
						<span class="chip-count">
							{chip.key === 'all' ? dashStats.total : dashStats[chip.key as keyof typeof dashStats]}
						</span>
					</button>
				{/each}
			</div>

			<!-- ── Table ─────────────────────────────────────────────── -->
			<div class="dash-table-wrap">
				<!-- Header -->
				<div class="dash-table-head">
					<div>Candidate</div>
					<div>Skills</div>
					<div>Strength</div>
					<div>Status</div>
					<div>Actions</div>
				</div>

				<!-- Rows -->
				{#if dashPageRows.length === 0}
					<div class="dash-empty">
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
						<p>No resumes match this filter.</p>
					</div>
				{:else}
					{#each dashPageRows as r}
						{@const rs = getResumeStatus(r)}
						{@const rstr = getResumeStrength(r)}
						{@const statusMeta = {
							active:    { label: 'Active',    cls: 'pill-active' },
							completed: { label: 'Completed', cls: 'pill-completed' },
							inactive:  { label: 'Inactive',  cls: 'pill-inactive' },
							deleted:   { label: 'Deleted',   cls: 'pill-deleted' },
						}[rs]}
						<div class="dash-table-row">
							<div class="dtrow-name">
								<div class="dtrow-av">{(r.name || '?').charAt(0).toUpperCase()}</div>
								<div>
									<div class="dtrow-nametext">{r.name || '—'}</div>
									<div class="dtrow-email">{r.email || '—'}</div>
								</div>
							</div>
							<div class="dtrow-skills">
								{#each (r.skills || '').split(',').slice(0, 3).map((s: string) => s.trim()).filter(Boolean) as tag}
									<span class="pv-tag sm">{tag}</span>
								{/each}
								{#if (r.skills || '').split(',').length > 3}
									<span class="rc-more">+{(r.skills || '').split(',').length - 3}</span>
								{/if}
							</div>
							<div class="dtrow-str">
								<div class="str-bar-wrap">
									<div class="str-bar-fill" style="width:{rstr}%; background:{rstr===100?'#10b981':rstr>=67?'#3b82f6':rstr>=34?'#f59e0b':'#ef4444'}"></div>
								</div>
								<span class="str-val">{rstr}%</span>
							</div>
							<div>
								<span class="status-pill {statusMeta.cls}">{statusMeta.label}</span>
							</div>
							<div class="dtrow-actions">
								<button class="btn-rc edit" onclick={() => editResume(r)} title="Edit">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
									Edit
								</button>
								<button class="btn-rc pdf" onclick={() => downloadPDF({ name: r.name, email: r.email, phone: r.phone, education: r.education, skills: r.skills, experience: r.experience })} disabled={isDownloading} title="Download PDF">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
									PDF
								</button>
								<button class="btn-rc del" onclick={() => deleteResume(r.id)} title="Delete">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
									Delete
								</button>
							</div>
						</div>
					{/each}
				{/if}

				<!-- Pagination -->
				<div class="dash-pagination">
					<span class="pg-info">{dashFiltered.length} resume{dashFiltered.length !== 1 ? 's' : ''}</span>
					<div class="pg-btns">
						{#each Array.from({ length: dashTotalPages }, (_, i) => i + 1) as pg}
							<button
								class="pg-btn"
								class:pg-active={pg === dashPage}
								onclick={() => (dashPage = pg)}
							>{pg}</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
		{/if}
	</main>

	<footer class="footer">
		Built with SvelteKit · NeonDB · jsPDF &nbsp;·&nbsp; Resume Builder
	</footer>
</div>

<style>
	*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

	.app {
		min-height: 100vh;
		background: #f1f5f9;
		font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
		color: #1e293b;
		font-size: 14px;
		line-height: 1.5;
	}

	/* ── Header ─────────────────────────────────────────────────────── */
	.header {
		background: #fff; border-bottom: 1px solid #e2e8f0; height: 56px;
		padding: 0 24px; display: flex; align-items: center;
		justify-content: space-between; position: sticky; top: 0; z-index: 100;
	}
	.header-brand { display: flex; align-items: center; gap: 12px; }
	.logo { width: 34px; height: 34px; border-radius: 9px; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; letter-spacing: -1px; flex-shrink: 0; }
	.brand-name { font-size: 15px; font-weight: 700; letter-spacing: -0.4px; color: #0f172a; }
	.brand-accent { color: #2563eb; }
	.brand-sub { font-size: 11px; color: #94a3b8; }
	.header-actions { display: flex; align-items: center; gap: 10px; }
	.editing-badge { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
	.btn-ghost { display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 8px; background: transparent; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 500; color: #475569; cursor: pointer; transition: all 0.15s; }
	.btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
	.avatar { width: 34px; height: 34px; border-radius: 50%; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }

	/* ── Tab bar ────────────────────────────────────────────────────── */
	.tab-bar { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 0 24px; display: flex; }
	.tab { display: flex; align-items: center; gap: 7px; padding: 13px 16px; border: none; background: transparent; cursor: pointer; font-size: 13px; font-weight: 500; color: #64748b; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s, border-color 0.15s; }
	.tab:hover { color: #1e293b; }
	.tab.active { color: #2563eb; border-bottom-color: #2563eb; }
	.tab-dashboard.active { color: #6366f1; border-bottom-color: #6366f1; }
	.tab-pill { padding: 1px 7px; border-radius: 100px; background: #dbeafe; color: #2563eb; font-size: 10px; font-weight: 700; }
	.dash-pill { background: #ede9fe; color: #6366f1; }

	/* ── Main ───────────────────────────────────────────────────────── */
	.main { max-width: 1140px; margin: 0 auto; padding: 28px 24px; }

	/* ── Two-column grid ────────────────────────────────────────────── */
	.grid-two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 22px; align-items: start; }
	@media (max-width: 800px) { .grid-two { grid-template-columns: 1fr; } .preview-col { display: none; } }
	.form-col { display: flex; flex-direction: column; gap: 14px; }
	.preview-col { position: sticky; top: 112px; }

	/* ── Card ───────────────────────────────────────────────────────── */
	.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; }

	/* ── Strength ───────────────────────────────────────────────────── */
	.strength-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
	.strength-label { font-size: 13px; font-weight: 600; color: #475569; }
	.strength-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; border: 1px solid; }
	.strength-track { width: 100%; height: 6px; background: #f1f5f9; border-radius: 100px; overflow: hidden; }
	.strength-fill { height: 100%; border-radius: 100px; transition: width 0.5s cubic-bezier(.4,0,.2,1), background 0.4s; }
	.checklist { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; }
	.check-chip { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; color: #94a3b8; padding: 3px 9px; border-radius: 100px; background: #f8fafc; border: 1px solid #f1f5f9; transition: all 0.2s; }
	.check-chip.done { color: #10b981; background: #ecfdf5; border-color: #a7f3d0; }
	.check-circle { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid #cbd5e1; display: block; }

	/* ── Section head ───────────────────────────────────────────────── */
	.section-head { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 16px; }
	.section-head svg { color: #2563eb; flex-shrink: 0; }

	/* ── Fields ─────────────────────────────────────────────────────── */
	.fields { display: flex; flex-direction: column; gap: 12px; }
	.field { display: flex; flex-direction: column; gap: 5px; }
	.flabel { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
	.inp { width: 100%; padding: 9px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 9px; font-size: 13px; color: #1e293b; outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; font-family: inherit; }
	.inp::placeholder { color: #94a3b8; }
	.inp:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
	.ta { resize: vertical; min-height: 72px; line-height: 1.65; }
	.phone-row { display: flex; gap: 8px; }
	.code-inp { width: 82px; flex-shrink: 0; }
	.tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
	.skill-pill { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 100px; }

	/* ── Buttons ────────────────────────────────────────────────────── */
	.action-group { display: flex; gap: 10px; }
	.btn-save { flex: 1; padding: 11px 16px; border-radius: 10px; background: #2563eb; color: #fff; border: none; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: background 0.15s, transform 0.1s; }
	.btn-save:hover:not(:disabled) { background: #1d4ed8; }
	.btn-save:active:not(:disabled) { transform: scale(0.99); }
	.btn-save:disabled { opacity: 0.45; cursor: not-allowed; }
	.btn-pdf { padding: 11px 18px; border-radius: 10px; background: #fff; color: #2563eb; border: 1.5px solid #bfdbfe; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.15s; white-space: nowrap; }
	.btn-pdf:hover:not(:disabled) { background: #eff6ff; border-color: #93c5fd; }
	.btn-pdf:disabled { opacity: 0.45; cursor: not-allowed; }
	.btn-refresh { display: flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 9px; background: #fff; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
	.btn-refresh:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
	.btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

	/* ── Preview ────────────────────────────────────────────────────── */
	.preview-card { padding: 20px; }
	.preview-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
	.live-indicator { display: flex; align-items: center; gap: 7px; }
	.live-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; animation: blink 2s ease-in-out infinite; }
	@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
	.live-text { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.09em; }
	.btn-preview-pdf { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 7px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
	.btn-preview-pdf:hover:not(:disabled) { background: #dbeafe; }
	.btn-preview-pdf:disabled { opacity: 0.45; cursor: not-allowed; }
	.pv-profile { display: flex; align-items: center; gap: 14px; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
	.pv-avatar { width: 48px; height: 48px; border-radius: 50%; background: #2563eb; color: #fff; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; }
	.pv-name { font-size: 16px; font-weight: 800; color: #0f172a; }
	.pv-detail { font-size: 11.5px; color: #64748b; margin-top: 2px; }
	.pv-sections { display: flex; flex-direction: column; gap: 14px; }
	.pv-sec-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #2563eb; margin-bottom: 5px; }
	.pv-text { font-size: 12px; color: #475569; line-height: 1.65; white-space: pre-wrap; }
	.pv-text.faint { color: #cbd5e1; }
	.pv-tags { display: flex; flex-wrap: wrap; gap: 5px; }
	.pv-tag { background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 100px; }
	.pv-tag.sm { font-size: 10px; padding: 2px 7px; }
	.pv-empty { margin-top: 18px; padding: 18px; border: 1.5px dashed #e2e8f0; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 7px; text-align: center; }
	.pv-empty p { font-size: 12px; color: #94a3b8; }

	/* ── Saved view ─────────────────────────────────────────────────── */
	.saved-view {}
	.saved-bar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
	.saved-title { font-size: 18px; font-weight: 700; color: #0f172a; }
	.saved-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
	.state-center { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 72px 24px; text-align: center; }
	.empty-icon-wrap { width: 72px; height: 72px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
	.state-title { font-size: 16px; font-weight: 700; color: #334155; }
	.state-sub { font-size: 13px; color: #94a3b8; max-width: 280px; line-height: 1.6; }
	.state-text { font-size: 13px; color: #94a3b8; }
	.btn-primary-sm { display: flex; align-items: center; gap: 6px; margin-top: 4px; padding: 9px 20px; background: #2563eb; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
	.btn-primary-sm:hover { background: #1d4ed8; }
	.resume-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 16px; }
	.resume-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 13px; transition: border-color 0.15s, box-shadow 0.15s; }
	.resume-card:hover { border-color: #93c5fd; box-shadow: 0 4px 16px rgba(37,99,235,.08); }
	.rc-top { display: flex; align-items: center; gap: 12px; }
	.rc-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; }
	.rc-name { font-size: 14px; font-weight: 700; color: #0f172a; }
	.rc-email { font-size: 12px; color: #94a3b8; margin-top: 2px; }
	.rc-skills { display: flex; flex-wrap: wrap; gap: 5px; }
	.rc-more { font-size: 10px; color: #94a3b8; font-weight: 600; display: flex; align-items: center; padding: 2px 0; }
	.rc-actions { display: flex; gap: 7px; border-top: 1px solid #f1f5f9; padding-top: 13px; }
	.btn-rc { flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 7px 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11.5px; font-weight: 600; cursor: pointer; background: #f8fafc; transition: all 0.15s; font-family: inherit; }
	.btn-rc.edit { color: #2563eb; }
	.btn-rc.edit:hover { background: #eff6ff; border-color: #93c5fd; }
	.btn-rc.pdf { color: #7c3aed; }
	.btn-rc.pdf:hover { background: #f5f3ff; border-color: #c4b5fd; }
	.btn-rc.pdf:disabled { opacity: 0.45; cursor: not-allowed; }
	.btn-rc.del { color: #ef4444; }
	.btn-rc.del:hover { background: #fef2f2; border-color: #fca5a5; }

	/* ── Dashboard view ─────────────────────────────────────────────── */
	.dash-view { display: flex; flex-direction: column; gap: 18px; }
	.dash-topbar { display: flex; align-items: flex-start; justify-content: space-between; }
	.dash-heading { font-size: 20px; font-weight: 700; color: #0f172a; }
	.dash-subhead { font-size: 12px; color: #94a3b8; margin-top: 2px; }

	/* Stat cards */
	.dash-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
	.dash-stat-card {
		background: #fff; border: 1.5px solid #e2e8f0; border-radius: 14px;
		padding: 16px 16px 12px; cursor: pointer; text-align: left;
		display: flex; flex-direction: column; gap: 10px;
		transition: border-color 0.15s, box-shadow 0.15s;
		font-family: inherit;
	}
	.dash-stat-card:hover { border-color: var(--accent, #6366f1); box-shadow: 0 4px 16px rgba(0,0,0,.06); }
	.dash-stat-card.active { border-color: var(--accent, #6366f1); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 12%, transparent); }
	.dsc-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
	.dsc-body { display: flex; flex-direction: column; gap: 1px; }
	.dsc-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .06em; }
	.dsc-num { font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1.1; }
	.dsc-sub { font-size: 11px; color: #94a3b8; }
	.dsc-bar { width: 100%; height: 3px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
	.dsc-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }

	/* Charts */
	.dash-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	@media (max-width: 700px) { .dash-charts { grid-template-columns: 1fr; } }
	.chart-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; }
	.chart-title { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 14px; }
	.cbar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
	.cbar-lbl { font-size: 11px; color: #64748b; width: 70px; flex-shrink: 0; text-align: right; }
	.cbar-track { flex: 1; height: 7px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
	.cbar-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }
	.cbar-val { font-size: 11px; color: #94a3b8; width: 32px; text-align: right; flex-shrink: 0; }
	.chart-donut-card {}
	.donut-wrap { display: flex; align-items: center; gap: 20px; margin-top: 4px; }
	.donut-legend { display: flex; flex-direction: column; gap: 8px; }
	.leg-row { display: flex; align-items: center; gap: 7px; font-size: 12px; }
	.leg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
	.leg-label { color: #64748b; flex: 1; }
	.leg-count { font-weight: 700; color: #1e293b; }

	/* Search + filter */
	.dash-search-row { display: flex; gap: 10px; align-items: center; }
	.search-wrap { flex: 1; position: relative; display: flex; align-items: center; }
	.search-icon { position: absolute; left: 11px; color: #94a3b8; pointer-events: none; }
	.dash-search-inp { width: 100%; padding: 9px 12px 9px 34px; background: #fff; border: 1px solid #e2e8f0; border-radius: 9px; font-size: 13px; color: #1e293b; outline: none; font-family: inherit; transition: border-color .15s, box-shadow .15s; }
	.dash-search-inp:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
	.dash-search-inp::placeholder { color: #94a3b8; }
	.dash-sort-sel { padding: 9px 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 9px; font-size: 12px; color: #475569; outline: none; cursor: pointer; font-family: inherit; }

	/* Filter chips */
	.dash-chips { display: flex; flex-wrap: wrap; gap: 7px; }
	.filter-chip {
		display: flex; align-items: center; gap: 5px;
		padding: 5px 12px; border-radius: 100px;
		border: 1px solid #e2e8f0; background: #fff;
		font-size: 12px; color: #64748b; cursor: pointer;
		transition: all 0.15s; font-family: inherit;
	}
	.filter-chip:hover { border-color: var(--chip-color); color: #1e293b; }
	.filter-chip.active { border-color: var(--chip-color); background: color-mix(in srgb, var(--chip-color) 8%, white); color: #1e293b; font-weight: 600; }
	.chip-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
	.chip-count { margin-left: 2px; font-size: 10px; font-weight: 700; color: #94a3b8; }
	.filter-chip.active .chip-count { color: var(--chip-color); }

	/* Table */
	.dash-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
	.dash-table-head {
		display: grid; grid-template-columns: 2fr 1.4fr 1fr 1fr 1.1fr;
		padding: 10px 18px; background: #f8fafc;
		font-size: 11px; font-weight: 700; color: #64748b;
		text-transform: uppercase; letter-spacing: .06em;
		border-bottom: 1px solid #e2e8f0;
	}
	.dash-table-row {
		display: grid; grid-template-columns: 2fr 1.4fr 1fr 1fr 1.1fr;
		padding: 13px 18px; align-items: center;
		border-bottom: 1px solid #f1f5f9;
		transition: background 0.1s;
	}
	.dash-table-row:last-child { border-bottom: none; }
	.dash-table-row:hover { background: #f8fafc; }
	.dtrow-name { display: flex; align-items: center; gap: 10px; }
	.dtrow-av { width: 32px; height: 32px; border-radius: 50%; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
	.dtrow-nametext { font-size: 13px; font-weight: 600; color: #0f172a; }
	.dtrow-email { font-size: 11px; color: #94a3b8; margin-top: 1px; }
	.dtrow-skills { display: flex; flex-wrap: wrap; gap: 4px; }
	.dtrow-str { display: flex; align-items: center; gap: 7px; }
	.str-bar-wrap { width: 52px; height: 5px; background: #f1f5f9; border-radius: 3px; overflow: hidden; flex-shrink: 0; }
	.str-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
	.str-val { font-size: 11px; color: #94a3b8; }
	.dtrow-actions { display: flex; gap: 5px; }
	.dtrow-actions .btn-rc { flex: 0 0 auto; padding: 5px 9px; font-size: 11px; }
	.dash-empty { padding: 48px 24px; text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 13px; }

	/* Status pills */
	.status-pill { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 100px; font-size: 11px; font-weight: 600; }
	.pill-active    { background: #ecfdf5; color: #059669; }
	.pill-completed { background: #fffbeb; color: #d97706; }
	.pill-inactive  { background: #f8fafc; color: #64748b; }
	.pill-deleted   { background: #fef2f2; color: #dc2626; }

	/* Pagination */
	.dash-pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-top: 1px solid #f1f5f9; }
	.pg-info { font-size: 12px; color: #94a3b8; }
	.pg-btns { display: flex; gap: 4px; }
	.pg-btn { padding: 4px 11px; border-radius: 7px; border: 1px solid #e2e8f0; background: #fff; font-size: 12px; color: #64748b; cursor: pointer; font-family: inherit; transition: all .15s; }
	.pg-btn:hover { background: #f8fafc; }
	.pg-btn.pg-active { background: #6366f1; color: #fff; border-color: #6366f1; }

	/* ── Spinner ─────────────────────────────────────────────────────── */
	.spin { display: inline-block; width: 13px; height: 13px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; animation: rot .7s linear infinite; flex-shrink: 0; }
	.spin.dark { border-color: rgba(37,99,235,.2); border-top-color: #2563eb; }
	.spin.lg { width: 28px; height: 28px; border-width: 3px; }
	@keyframes rot { to { transform: rotate(360deg); } }

	/* ── Footer ──────────────────────────────────────────────────────── */
	.footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding: 18px 24px; margin-top: 48px; }

	::-webkit-scrollbar { width: 5px; }
	::-webkit-scrollbar-track { background: transparent; }
	::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 8px; }
	::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
	html { scroll-behavior: smooth; }
</style>