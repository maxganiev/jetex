<script>
	import SheetLabel from '$lib/components/SelectorSheets/SheetLabel.svelte';
	import InputRow from './components/InputRow.svelte';
	import InputColumn from './components/InputColumn.svelte';
	import InputCell from './components/InputCell.svelte';
	import { globals } from '$lib/globals';

	const TITLE = 'Калькулятор потерь напора в трубопроводе';

	function roundToStage(value = 0, stage = 8) {
		return Number(value).toFixed(stage);
	}

	$: qPerHr = 0;
	$: qPerSec = roundToStage(qPerHr / 3600);

	$: viscosity = 0;
	$: viscosityPerSec = roundToStage(viscosity / 1000 ** 2);

	$: pipeDMilim = 0;
	$: pipeDMet = roundToStage(pipeDMilim / 1000);

	$: pipeLength = 0;

	const pipeMaterialOptions = [
		{ id: 1, text: 'Медь, свинец, латунь, алюминиий', value: '0.001' },

		{ id: 2, text: 'ПВХ и пластиковые трубы', value: '0.0015' },

		{ id: 3, text: 'Подвижные резиновые уплотнители', value: '0.006' },

		{ id: 4, text: 'Нержавеющая сталь', value: '0.0015' },

		{ id: 5, text: 'Стальная труба', value: '0.045' },

		{ id: 6, text: 'Сварная сталь', value: '0.045' },

		{ id: 7, text: 'Углеродистая сталь неиспользованная', value: '0.02' },

		{ id: 8, text: 'Углеродистая сталь с небольшой коррозией', value: '0.05' },

		{ id: 9, text: 'Углеродистая сталь с коррозией средней степени', value: '0.15' },

		{ id: 10, text: 'Углеродистая сталь с коррозией высокой степени', value: '1' },

		{ id: 11, text: 'Чугун неиспользованный', value: '0.25' },

		{ id: 12, text: 'Изношенный чугун', value: '0.8' },

		{ id: 13, text: 'Ржавый чугун', value: '1.5' },

		{ id: 14, text: 'Оцинкованный чугун', value: '0.025' },

		{ id: 15, text: 'Дерево', value: '0.18' },

		{ id: 16, text: 'Дерево б/у', value: '0.25' },

		{ id: 17, text: 'Цемент', value: '0.3' }
	];

	$: pipeMaterialSelected = pipeMaterialOptions[0];

	$: averageVelocity = roundToStage(Number(qPerSec) / ((Number(pipeDMet) ** 2 * Math.PI) / 4));

	$: reynoldNum = roundToStage((Number(averageVelocity) * Number(pipeDMet)) / Number(viscosityPerSec));

	$: specificRoughness = Number(pipeMaterialSelected.value) / 1000;

	$: darcyFrictionFactor = (() => {
		if (Number(reynoldNum) < 3000) return roundToStage(64 / Number(reynoldNum));

		return roundToStage(
			0.25 /
				Math.log10(Number(specificRoughness) / Number(pipeDMet) + 5.74 / Number(reynoldNum) ** 0.9) ** 2
		);
	})();

	function calcValveHeadVelocity(valveKoeff = -1, valvesQty = -1, avVelocity = 0) {
		const KOEFF = 2 * 9.81;

		return (valveKoeff * Number(valvesQty) * Number(avVelocity) ** 2) / KOEFF;
	}

	const ANGLE_VALVE_KOEFF = 5;
	$: angleValveQty = 0;
	$: angleValveVelocity = calcValveHeadVelocity(ANGLE_VALVE_KOEFF, angleValveQty, Number(averageVelocity));

	const FOOT_VALVE_KOEFF = 0.9;
	$: footValveQty = 0;
	$: footValveVelocity = calcValveHeadVelocity(FOOT_VALVE_KOEFF, footValveQty, Number(averageVelocity));

	const BALL_VALVE_KOEFF = 0.05;
	$: ballValveQty = 0;
	$: ballValveVelocity = calcValveHeadVelocity(BALL_VALVE_KOEFF, ballValveQty, Number(averageVelocity));

	const GATE_VALVE_KOEFF = 0.2;
	$: gateValveQty = 0;
	$: gateValveVelocity = calcValveHeadVelocity(GATE_VALVE_KOEFF, gateValveQty, Number(averageVelocity));

	const BUTTERFLY_VALVE_KOEFF = 0.6;
	$: butterflyValveQty = 0;
	$: butterflyValveVelocity = calcValveHeadVelocity(
		BUTTERFLY_VALVE_KOEFF,
		butterflyValveQty,
		Number(averageVelocity)
	);

	const GLOBE_VALVE_KOEFF = 10;
	$: globeValveQty = 0;
	$: globeValveVelocity = calcValveHeadVelocity(GLOBE_VALVE_KOEFF, globeValveQty, Number(averageVelocity));

	const CHECK_VALVE_KOEFF = 2.3;
	$: checkValveQty = 0;
	$: checkValveVelocity = calcValveHeadVelocity(CHECK_VALVE_KOEFF, checkValveQty, Number(averageVelocity));

	const PIPE_ENTRANCE_KOEFF = 1;
	$: pipeEntranceQty = 0;
	$: pipeEntranceVelocity = calcValveHeadVelocity(PIPE_ENTRANCE_KOEFF, pipeEntranceQty, Number(averageVelocity));

	const ELBOW_VALVE_KOEFF = 0.4;
	$: elbowValveQty = 0;
	$: elbowValveVelocity = calcValveHeadVelocity(ELBOW_VALVE_KOEFF, elbowValveQty, Number(averageVelocity));

	const PIPE_ENTRANCE_SHARP_KOEFF = 0.5;
	$: pipeEntranceSharpQty = 0;
	$: pipeEntranceSharpVelocity = calcValveHeadVelocity(
		PIPE_ENTRANCE_SHARP_KOEFF,
		pipeEntranceSharpQty,
		Number(averageVelocity)
	);

	const ELBOW_VALVE_90_KOEFF = 0.6;
	$: elbowValve90Qty = 0;
	$: elbowValve90Velocity = calcValveHeadVelocity(ELBOW_VALVE_90_KOEFF, elbowValve90Qty, Number(averageVelocity));

	const PIPE_EXIT_KOEFF = 1;
	$: pipeExitQty = 0;
	$: pipeExitVelocity = calcValveHeadVelocity(PIPE_EXIT_KOEFF, pipeExitQty, Number(averageVelocity));

	const ELBOW_VALVE_90_STD_KOEFF = 0.9;
	$: elbowValve90StandardQty = 0;
	$: elbowValve90StandardVelocity = calcValveHeadVelocity(
		ELBOW_VALVE_90_STD_KOEFF,
		elbowValve90StandardQty,
		Number(averageVelocity)
	);

	const TEE_STD_KOEFF = 1.8;
	$: teeStdQty = 0;
	$: teeStdVelocity = calcValveHeadVelocity(TEE_STD_KOEFF, teeStdQty, Number(averageVelocity));

	const FLOW_METER_KOEFF = 7;
	$: flowMeterQty = 0;
	$: flowMeterVelocity = calcValveHeadVelocity(FLOW_METER_KOEFF, flowMeterQty, Number(averageVelocity));

	const TEE_FTR_KOEFF = 0.6;
	$: teeFtrQty = 0;
	$: teeFtrVelocity = calcValveHeadVelocity(TEE_FTR_KOEFF, teeFtrQty, Number(averageVelocity));

	$: totalFittingsLosses =
		angleValveVelocity +
		footValveVelocity +
		ballValveVelocity +
		gateValveVelocity +
		butterflyValveVelocity +
		globeValveVelocity +
		checkValveVelocity +
		pipeEntranceVelocity +
		elbowValveVelocity +
		pipeEntranceSharpVelocity +
		elbowValve90Velocity +
		elbowValve90StandardVelocity +
		pipeExitVelocity +
		teeStdVelocity +
		flowMeterVelocity +
		teeFtrVelocity;

	$: totalStaightPipesLosses =
		(Number(darcyFrictionFactor) * pipeLength * Number(averageVelocity) ** 2) / (2 * Number(pipeDMet) * 9.81);

	$: totalPipeLineLosses = totalFittingsLosses + totalStaightPipesLosses;

	/**
	 * @param {number } value
	 */
	function printValidTotal(value) {
		return value === 0 || isNaN(value) ? 0 : roundToStage(value);
	}
</script>

<svelte:head>
	<title>{TITLE}</title>
</svelte:head>

<SheetLabel text="{TITLE}"></SheetLabel>
<br />

<div id="pipes_view" class="w-100">
	<img
		src="{globals.imagePath}pipe_transforms.png"
		alt="pipe views"
		class="d-block mx-auto"
		style="max-height: 200px; max-width: 100%;"
	/>

	<p class="fs-sm-md font-italic text-center clr-blue">Рис.1 Типы трубных переходов </p>
</div>

<!--Расход-->
<InputRow>
	<InputCell label="Расход, м<sup>3</sup>/час" bind:value="{qPerHr}"></InputCell>

	<InputCell label="Расход, м<sup>3</sup>/с" bind:value="{qPerSec}" readonly></InputCell>
</InputRow>

<!--Вязкость-->
<InputRow>
	<InputCell label="Кинематическая вязкость, cst" bind:value="{viscosity}"></InputCell>

	<InputCell label="Кинематическая вязкость, м<sup>3</sup>/с" bind:value="{viscosityPerSec}" readonly></InputCell>
</InputRow>

<!--Внутренний диаметр трубы-->
<InputRow>
	<InputCell label="Внутренний диаметр трубы, мм" bind:value="{pipeDMilim}"></InputCell>

	<InputCell label="Внутренний диаметр трубы, м" bind:value="{pipeDMet}" readonly></InputCell>
</InputRow>

<!--Длина и материал трубы-->
<InputRow>
	<InputCell label="Длина трубы, м" bind:value="{pipeLength}"></InputCell>

	<InputCell
		label="Выберите материал трубы"
		bind:value="{pipeMaterialSelected}"
		type="select"
		options="{pipeMaterialOptions}"
	></InputCell>
</InputRow>

<!--Вычисляемые параметры-->
<InputRow>
	<InputCell label="Удельная шероховатость (𝜀), м" bind:value="{specificRoughness}" readonly></InputCell>

	<InputCell label="Средняя скорость, м/с" bind:value="{averageVelocity}" readonly></InputCell>
</InputRow>

<InputRow>
	<InputCell label="Число Рейнольдса (Re)" bind:value="{reynoldNum}" readonly></InputCell>

	<InputCell label="Коэффициент трения Дарси (fx)" bind:value="{darcyFrictionFactor}" readonly></InputCell>
</InputRow>

<!--Фитинги-->
<InputRow>
	<!-- Угловой вентиль-->
	<InputColumn>
		<InputCell label="Количество угловых вентилей" fullWidth bind:value="{angleValveQty}"></InputCell>

		<InputCell fullWidth bind:value="{angleValveVelocity}" readonly></InputCell>
	</InputColumn>

	<!--Донный клапан-->
	<InputColumn>
		<InputCell label="Количество донных клапанов" fullWidth bind:value="{footValveQty}"></InputCell>

		<InputCell fullWidth bind:value="{footValveVelocity}" readonly></InputCell>
	</InputColumn>
</InputRow>

<InputRow>
	<!--Шаровой кран, полнопроходной-->
	<InputColumn>
		<InputCell label="Количество шаровых кранов" fullWidth bind:value="{ballValveQty}"></InputCell>

		<InputCell fullWidth bind:value="{ballValveVelocity}" readonly></InputCell>
	</InputColumn>

	<!--Задвижка-->
	<InputColumn>
		<InputCell label="Количество задвижек" fullWidth bind:value="{gateValveQty}"></InputCell>

		<InputCell fullWidth bind:value="{gateValveVelocity}" readonly></InputCell>
	</InputColumn>
</InputRow>

<InputRow>
	<!--Дисковый затвор -->
	<InputColumn>
		<InputCell label="Количество дисковых затворов" fullWidth bind:value="{butterflyValveQty}"></InputCell>

		<InputCell fullWidth bind:value="{butterflyValveVelocity}" readonly></InputCell>
	</InputColumn>

	<!--Запорный клапан-->
	<InputColumn>
		<InputCell label="Количество запорных клапанов" fullWidth bind:value="{globeValveQty}"></InputCell>

		<InputCell fullWidth bind:value="{globeValveVelocity}" readonly></InputCell>
	</InputColumn>
</InputRow>

<InputRow>
	<!--Поворотный клапан-->
	<InputColumn>
		<InputCell label="Количество поворотных клапанов" fullWidth bind:value="{checkValveQty}"></InputCell>

		<InputCell fullWidth bind:value="{checkValveVelocity}" readonly></InputCell>
	</InputColumn>

	<!--Вход трубы, труба, направленная внутрь -->
	<InputColumn>
		<InputCell
			label="Кол-во трубных переходов <a style='text-decoration: none;
		font-style: italic;
		color: inherit; font-weight: 600;' href='#pipes_view'>типа c</a>"
			fullWidth
			bind:value="{pipeEntranceQty}"
		></InputCell>

		<InputCell fullWidth bind:value="{pipeEntranceVelocity}" readonly></InputCell>
	</InputColumn>
</InputRow>

<InputRow>
	<!--Колено 45°-->
	<InputColumn>
		<InputCell label="Количество колен 45°" fullWidth bind:value="{elbowValveQty}"></InputCell>

		<InputCell fullWidth bind:value="{elbowValveVelocity}" readonly></InputCell>
	</InputColumn>

	<!--Вход трубы, острый край -->
	<InputColumn>
		<InputCell
			label="Кол-во трубных переходов <a style='text-decoration: none;
		font-style: italic;
		color: inherit; font-weight: 600;' href='#pipes_view'>типа d</a>"
			fullWidth
			bind:value="{pipeEntranceSharpQty}"
		></InputCell>

		<InputCell fullWidth bind:value="{pipeEntranceSharpVelocity}" readonly></InputCell>
	</InputColumn>
</InputRow>

<InputRow>
	<!--Колено 90°-->
	<InputColumn>
		<InputCell label="Количество колен 90° (широкий радиус)" fullWidth bind:value="{elbowValve90Qty}"
		></InputCell>

		<InputCell fullWidth bind:value="{elbowValve90Velocity}" readonly></InputCell>
	</InputColumn>

	<!--Кол-во выходов трубы -->
	<InputColumn>
		<InputCell label="Кол-во трубных выходов" fullWidth bind:value="{pipeExitQty}"></InputCell>

		<InputCell fullWidth bind:value="{pipeExitVelocity}" readonly></InputCell>
	</InputColumn>
</InputRow>

<InputRow>
	<!--Колено 90°-->
	<InputColumn>
		<InputCell label="Количество колен 90° (стандартные)" fullWidth bind:value="{elbowValve90StandardQty}"
		></InputCell>

		<InputCell fullWidth bind:value="{elbowValve90StandardVelocity}" readonly></InputCell>
	</InputColumn>

	<!--Кол-во стандартных тройников с проточным ответвлением -->
	<InputColumn>
		<InputCell label="Кол-во тройников с проточным ответвлением" fullWidth bind:value="{teeStdQty}"></InputCell>

		<InputCell fullWidth bind:value="{teeStdVelocity}" readonly></InputCell>
	</InputColumn>
</InputRow>

<InputRow>
	<!--Расходомер турбинного типа-->
	<InputColumn>
		<InputCell label="Кол-во расходомеров турбинного типа" fullWidth bind:value="{flowMeterQty}"></InputCell>

		<InputCell fullWidth bind:value="{flowMeterVelocity}" readonly></InputCell>
	</InputColumn>

	<!--Тройник стандартный проточный-->
	<InputColumn>
		<InputCell label="Кол-во проточных тройников" fullWidth bind:value="{teeFtrQty}"></InputCell>

		<InputCell fullWidth bind:value="{teeFtrVelocity}" readonly></InputCell>
	</InputColumn>
</InputRow>

<ul class="list no-bullets fs-md p-0 pt-4">
	<li>
		Общие потери напора во всех фитингах: <strong>{printValidTotal(totalFittingsLosses)}м</strong>
	</li>

	<li>
		Общие потери напора во всех прямых трубах: <strong>{printValidTotal(totalStaightPipesLosses)}м</strong>
	</li>

	<li>
		Общие потери напора трубопровода: <strong>{printValidTotal(totalPipeLineLosses)}м</strong>
	</li>
</ul>
