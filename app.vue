<template>
	<div>
		<form @submit="$event.preventDefault()" method="POST">
			<input v-model.lazy="date" />
			<input v-model.lazy="state" />
			<button>Submit</button>
		</form>
		<div
			v-for="price in prices.filter((i) => premises.find(
					(j) =>
						j.premise_code ==
						i.premise_code
				)
			)"
			v-if="prices && premises"
		>
			{{ price.date }}
			{{ price.prices }}
			{{
				premises.find(
					(i) =>
						i.premise_code ==
						price.premise_code
				)?.premise
			}}
			{{
				items.find(
					(i) => i.item_code == price.item_code
				)?.item
			}}
			{{
				items.find(
					(i) => i.item_code == price.item_code
				)?.unit
			}}
		</div>
	</div>
</template>

<script setup lang="ts">
const date = ref("2023-03-01");
const state = ref("");
const month = computed(() => date.value.slice(0, 7));

const { data: items } = await useAsyncData("items", () =>
	$fetch(
		`https://opendosmapi-production.up.railway.app/api/dosm-public-pricecatcher/lookup_item`
	)
);
const { data: premises } = await useAsyncData(
	"premises",
	() =>
		$fetch(
			`https://opendosmapi-production.up.railway.app/api/dosm-public-pricecatcher/lookup_premise?${
				state.value ? "state=" + state.value : ""
			}`
		),
	{ watch: state }
);

const { data: prices } = await useAsyncData(
	"prices",
	() =>
		$fetch(
			`https://opendosmapi-production.up.railway.app/api/dosm-public-pricecatcher/pricecatcher_${month.value}?limit=1000&date=${date.value}`
		),
	{ watch: [date, premises], immediate: true }
);
</script>
