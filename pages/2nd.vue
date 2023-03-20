<template>
	<div class="flex flex-col items-center">
		<div class="max-w-4xl">
			<select
				v-model.lazy="state"
				class="border"
				placeholder="state"
			>
				<option value="">Whole Malaysia</option>
				<option
					v-for="state in listStates"
					:value="state"
				>
					{{ state }}
				</option>
			</select>
			<input
				v-model.lazy="limit"
				class="border"
				placeholder="limit"
			/>
			<HeadlessCombobox
				v-model="selectedItems"
				name="items"
				multiple
			>
				<HeadlessComboboxInput
					@change="
						queryItems = $event.target.value
					"
					:displayValue="(item) => item.item"
					placeholder="Add item"
				/>
				<div class="relative">
					<div
						class="absolute mt-1 w-full rounded-md bg-white shadow-lg"
					>
						<HeadlessComboboxOptions
							class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
						>
							<HeadlessComboboxOption
								v-if="
									items.length
								"
								v-for="item in items"
								:key="
									item.item_code
								"
								as="template"
								:value="
									item.item_code
								"
								v-slot="{
									active,
									selected,
								}"
								><li
									:class="[
										active
											? 'bg-amber-100 text-amber-900'
											: 'text-gray-900',
										'relative cursor-default select-none py-2 pl-10 pr-4',
									]"
								>
									<span
										v-if="
											item.item
										"
										:class="[
											selected
												? 'font-medium'
												: 'font-normal',
											'block truncate',
										]"
										>{{
											item.item
										}}</span
									>
									<span
										:class="[
											selected
												? 'font-medium'
												: 'font-normal',
											'block truncate',
										]"
										>{{
											item.unit
										}}</span
									>
									<span
										v-if="
											selected
										"
										class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
									>
										Selected
									</span>
								</li>
							</HeadlessComboboxOption>
						</HeadlessComboboxOptions>
					</div>
				</div>
			</HeadlessCombobox>
			<input
				v-model.lazy="date"
				class="border"
				placeholder="date"
			/>
			<div
				v-if="selectedItemsData.length"
				v-for="item in selectedItemsData"
				@click="removeItem(item.item_code)"
			>
				{{ item.item }}{{ item.unit
				}}{{ item.item_group }}{{ item.item_category }}
			</div>
			<div
				v-if="allPremisesData"
				v-for="premiseSection in allPremisesData.sort(
					function (a, b) {
						return b.length - a.length;
					}
				)"
			>
				<h2 class="px-4 text-2xl font-semibold">
					Total Items: {{ premiseSection.length }}
				</h2>
				<div class="flex flex-col gap-3 p-4">
					<div
						v-for="premise in premiseSection.premises.sort(
							function (a, b) {
								return (
									a.total -
									b.total
								);
							}
						)"
						@click="
							selectedExpandPremise =
								premise.premise_code
						"
						class="border p-4 justify-between flex flex-col gap-2 bg-white"
					>
						<div
							class="flex flex-col gap-2"
						>
							<div class="mb-2">
								{{
									premise.premise_name
								}}
							</div>
							<div
								v-if="
									premise.premise_code ==
										expandedPremise &&
									premise
										.items
										.length
								"
								v-for="(
									item,
									index
								) in premise.items"
								class="grid grid-cols-8 text-xs"
								@click="
									removeItem(
										item.item_code
									)
								"
							>
								<div
									class="col-span-5 flex"
								>
									<div
										class="w-6 flex-none"
									>
										{{
											index +
											1
										}}
									</div>
									<div>
										{{
											item.item
										}}
									</div>
								</div>
								<div
									class="col-span-1 text-right tabular-nums"
								>
									{{
										item.unit
									}}
								</div>
								<div
									class="col-span-2 text-right tabular-nums"
								>
									{{
										parseFloat(
											item.price
										).toFixed(
											2
										)
									}}
								</div>
							</div>
						</div>
						<div></div>
						<div class="self-end">
							Total:
							{{ premise.total }}
						</div>
					</div>
				</div>
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
const limit = ref(1000);
const date = ref("2023-03-14");
const state = ref("Kuala Lumpur");
const queryItems = ref();
const selectedItems = ref([]);

const { data: items } = await useAsyncData(
	"items",
	async () => {
		let query = client
			.from("lookup_item")
			.select("item, item_code");
		if (queryItems.value) {
			query = query.ilike("item", `%${queryItems.value}%`);
		}
		query = query.limit(20);
		const { data } = await query;
		return data;
	},
	{ watch: queryItems }
);

const { data: item_prices } = await useAsyncData(
	"item_prices",
	async () => {
		let query = client.from("item_prices").select("*");
		if (selectedItems.value) {
			query = query.in("item_code", selectedItems.value);
		}
		if (state.value) {
			query = query.textSearch("state", `'${state.value}'`, {
				type: "plain",
			});
		}
		if (date.value) {
			query = query.eq("date", date.value);
		}
		query = query.limit(limit.value);
		const { data, error } = await query;
		return data;
	},
	{ watch: [state, selectedItems, date, limit] }
);

function removeItem(value) {
	selectedItems.value = selectedItems.value.filter((i) => i != value);
}

const selectedItemsData = computed(() => {
	let data = [];
	if (selectedItems.value.length && item_prices.value) {
		for (let item of selectedItems.value) {
			data.push(
				item_prices.value.find(
					(i) => i.item_code == item
				)
			);
		}
	}
	return data;
});

const allPremises = computed(() => {
	if (item_prices.value) {
		return item_prices.value
			.map((item) => item.premise_code)
			.filter(
				(value, index, self) =>
					self.indexOf(value) === index
			);
	}
	return [];
});

const allPremisesData = computed(() => {
	if (allPremises.value.length) {
		let data = [];
		let length = 0;
		allPremises.value.forEach((i) => {
			const premiseName = item_prices.value.find(
				(j) => j.premise_code == i
			)?.premise;
			const obj = [];
			const allItems = item_prices.value.filter(
				(j) => j.premise_code == i
			);
			length = allItems.length;
			let total = 0;
			allItems.forEach((item) => {
				if (!isNaN(parseFloat(item.price))) {
					total += parseFloat(item.price);
				}
				obj.push({
					item: item.item,
					item_code: item.item_code,
					unit: item.unit,
					price: item.price,
				});
			});
			total = total.toFixed(2);
			if (
				data.length &&
				data.find((i) => i.length == length)
			) {
				data[
					data.findIndex(
						(i) => i.length == length
					)
				].premises.push({
					premise_name: premiseName,
					premise_code: i,
					items: obj,
					total: total,
				});
			} else {
				data.push({
					length: length,
					premises: [
						{
							premise_name:
								premiseName,
							premise_code: i,
							items: obj,
							total: total,
						},
					],
				});
			}
		});
		return data;
	}
	return [];
});

//manually expand dialog
const selectedExpandPremise = ref();
//clear selected dialog when new data
watch(allPremises, () => {
	selectedExpandPremise.value = null;
});

//set expanded dialog
const expandedPremise = computed(() => {
	if (selectedExpandPremise.value) {
		return selectedExpandPremise.value;
	}
	if (
		allPremisesData.value.length < 1 ||
		allPremisesData.value[0].premises.length < 1
	) {
		return null;
	}
	const sortedAllPremises = allPremisesData.value.sort(function (a, b) {
		return b.length - a.length;
	});
	const sortedPremisesByTotal = sortedAllPremises[0].premises.sort(
		function (a, b) {
			return a.total - b.total;
		}
	);
	return sortedPremisesByTotal[0].premise_code;
});
</script>
