<template>
        <div class="flex flex-col items-center">
	<div class="max-w-md">
		<select v-model.lazy="state" class="border" placeholder="state">
			<option v-for="state in listStates" :value="state">
				{{ state }}
			</option>
		</select>
		<input v-model.lazy="searchValue" class="border" placeholder="search" />
		<input v-model.lazy="date" class="border" placeholder="date" />
		<div v-for="item in item_prices" class="border">
			{{ item }}
		</div>
	</div>
</div>
</template>

<script setup>
const client = useSupabaseClient();

const listStates = [
	"Labuan",
	"Kuala Lumpur",
	"Selangor",
	"Perak",
	"Perlis",
	"Sabah",
	"Sarawak",
	"Kedah",
	"Negeri Sembilan",
	"Putrajaya",
	"Melaka",
	"Terengganu",
	"Kelantan",
	"Pahang",
	"Kedah",
	"Pulau Pinang",
        "Johor",
];

const searchValue = ref();
const date = ref();
const state = ref();

const { data: item_prices } = await useAsyncData(
	"item_prices",
	async () => {
		let query = client
			.from("item_prices")
			.select("*")
		if (state.value) {
			query = query.textSearch("state", `'${state.value}'`, {
				type: "plain",
			});
		}
		if (date.value) {
			query = query.eq('date', date.value);
		}
		if (searchValue.value) {
			query = query.textSearch(
				'premise_multicolumn_search',
				`'${searchValue.value}'`,
				{ type: "websearch" }
			);
		}
		query = query.limit(20000);
		const { data, error } = await query;
		return data;
	},
	{ watch: [state, searchValue, date] }
);

const allStates = computed(() => {
	return item_prices.value
		.map((item) => item.state)
		.filter((value, index, self) => self.indexOf(value) === index);
});
</script>
