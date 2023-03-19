<template>
	<div>
		<form @submit="$event.preventDefault()" method="POST">
			<input v-model.lazy="date" />
			<input v-model.lazy="state" />
			<input v-model.lazy="limit" />
			<select v-model.lazy="item_code">
			<option v-for="item in items" :value="item.item_code">{{ item.item }}</option>
			
			</select>
			<button>Submit</button>
		</form>
		{{ filteredPremises }}
		{{ pendingPrices ? 'loading...' : '' }}
		<div v-for="price, index in prices.sort(function(x,y){return x.price - y.price})" v-if="prices && premises">
		{{ index+1 }}
			{{ price.date }}
			{{ price.price }}
			{{
				premises.find(
					(i) =>
						i.premise_code ==
						price.premise_code
				)?.premise
			}}
			{{
				premises.find(
					(i) =>
						i.premise_code ==
						price.premise_code
				)?.state
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
const state = ref();
const limit = ref(1000)
const item_code = ref();
const month = computed(() => date.value.slice(0, 7));

const { data: items } = await useAsyncData("items", () =>
	$fetch(
		`https://opendosmapi-production.up.railway.app/api/dosm-public-pricecatcher/lookup_item`
	)
);
const { data: premises, refresh: refreshPremises } = await useFetch(
	`https://opendosmapi-production.up.railway.app/api/dosm-public-pricecatcher/lookup_premise`,
	{ query: { state } }
);

watch([state],() => {
		refreshPremises();
	}
);

const filteredPremises = computed(() => {
	let codes = "";
	if (!premises.value) {
		return null;
	}
	premises.value.forEach((i, index) => {
		codes += i.premise_code;
		if (index != premises.value.length - 1) {
			codes += ",";
		}
	});
	return codes;
});

const { data: prices, pending: pendingPrices, refresh: refreshPrices } = await useFetch(
	`https://opendosmapi-production.up.railway.app/api/dosm-public-pricecatcher/pricecatcher_${month.value}`,
	{ query: { date, premise_code: filteredPremises, limit, item_code } }
);

watch([date, premises, limit], () => {
	refreshPrices;
}, {immediate: true});
</script>
