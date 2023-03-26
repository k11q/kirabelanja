<template>
	<div class="flex flex-col items-center">
		<div class="max-w-lg w-full py-4">
			<div class="w-full flex flex-col gap-4">
			<h1 class="text-5xl font-bold my-2 px-4">KiraBelanja</h1>
			<p class="text-xs bg-neutral-700">Last update: 14/3/2023</p>
			<div class="px-4">
				<select
					v-model.lazy="state"
					class="flex-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out focus-within:border-blue-700 focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-700 sm:text-sm sm:leading-5"
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
			</div>
				<div class="flex-grow px-4">
					<HeadlessCombobox
						v-model="selectedItems"
						name="items"
						multiple
					>
						<HeadlessComboboxInput
							@change="
								queryItems =
									$event
										.target
										.value
							"
							:displayValue="
								(item) =>
									item.item
							"
							placeholder="Add item"
							class="relative w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out focus-within:border-blue-700 focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-700 sm:text-sm sm:leading-5"
						/>
						<div
							class="relative max-w-full"
						>
							<div
								class="absolute mt-0.5 w-full rounded-md bg-white shadow-lg"
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
												'relative cursor-default select-none py-2 pl-10 pr-12',
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
													capitalise(
														item.item
													)
												}}</span
											>
											<span
												:class="[
													selected
														? 'font-medium'
														: 'font-normal text-neutral-600',
													'absolute inset-y-0 right-0 flex items-center pr-4  text-sm',
												]"
												>{{
													item.unit
												}}</span
											>
											<span
												v-if="
													selected
												"
												class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-700"
											>
												<span
													class="bg-amber-200 rounded px-0.5 aspect-square"
												>
													<Icon
														name="lucide:check"
													/>
												</span>
											</span>
										</li>
									</HeadlessComboboxOption>
								</HeadlessComboboxOptions>
							</div>
						</div>
					</HeadlessCombobox>
				</div>
			</div>
                        <!--
			<div
				v-if="selectedItemsData.length"
				v-for="item in selectedItemsData.sort(
					(a, b) =>
						selectedItems.indexOf(
							a.item_code
						) -
						selectedItems.indexOf(
							b.item_code
						)
				)"
				@click="removeItem(item.item_code)"
			>
				{{ capitalise(item.item) }}{{ item.unit
				}}{{ item.item_group }}{{ item.item_category }}
			</div>
                        -->
			<div class="mt-4 border-t">
                        <div
				v-if="allPremisesData"
				v-for="premiseSection in allPremisesData.sort(
					function (a, b) {
						return b.length - a.length;
					}
				)"
			>
				<div class="flex flex-col">
					<div
						v-for="premise, index in premiseSection.premises.sort(
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
						class="border-b p-4 justify-between flex flex-col gap-2 cursor-default bg-white hover:bg-neutral-100"
					>
						<div
							class="flex flex-col gap-2"
						>
							<div
								:class="`flex justify-between items-center ${expandedPremise == premise.premise_code ? 'px-4 pt-4' : ''}`"
							>
								<div
									class="flex-grow font-medium text-neutral-700"
								>
									{{
										capitalise(
											premise.premise_name
										)
									}}
									<span
										v-if="
											selectedItems.length -
												premiseSection.length >
											0
										"
										class="text-red-400 text-sm items-center"
										>{{
											`missing ${
												selectedItems.length -
												premiseSection.length
											} items`
										}}</span
									>
								</div>
								<div
									class=""
									v-if="
										expandedPremise !=
										premise.premise_code
									"
								>
									<span
										class="text-neutral-700 text-sm mr-2"
										>RM</span
									><span class="text-lg font-medium tabular-nums">{{
										premise.total
									}}</span>
								</div>
							</div>
                                                        <div class="text-sm text-neutral-500 px-4" v-if="
									expandedPremise ==
									premise.premise_code
								">{{ premise.address }}</div>
							<div
								class="mt-2 flex flex-col gap-2 px-4"
								v-if="
									expandedPremise ==
									premise.premise_code
								"
							>
                                                        
								<div
									v-if="
										expandedPremise ==
										premise.premise_code
									"
									v-for="(
										item,
										index
									) in premise.items.sort(
					(a, b) =>
						selectedItems.indexOf(
							a.item_code
						) -
						selectedItems.indexOf(
							b.item_code
						)
				)"
									class="grid grid-cols-8"
			
								>
									<div
										class="col-span-5 flex"
									>
										<div
											class="w-6 flex-none flex items-center justify-center mr-2"
										>
                                                                                <button class="flex aspect-square h-4 w-4 items-center justify-center rounded-full bg-red-400 text-white" @click="
										removeItem(
											item.item_code
										)
									">
                                                                                        <Icon name="lucide:minus" size="0.75rem" />
                                                                                </button>
										</div>
										<div>
											{{
												capitalise(
													item.item
												)
											}}
										</div>
									</div>
									<div
										class="col-span-1 text-right items-center tabular-nums text-sm text-neutral-500"
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
								<div
									v-if="
										premise
											.items
											.length
									"
									v-for="item in selectedItemsData.filter(
										(
											i
										) => {
											return (
												premise.items.findIndex(
													(
														j
													) =>
														j.item_code ==
														i.item_code
												) ==
												-1
											);
										}
									).sort(
					(a, b) =>
						selectedItems.indexOf(
							a.item_code
						) -
						selectedItems.indexOf(
							b.item_code
						)
				)"
									class="grid grid-cols-8 text-red-500"
								>
									<div
										class="col-span-5 flex"
									>
                                                                        <div
											class="w-6 flex-none flex items-center justify-center mr-2"
										>
                                                                                <button class="flex aspect-square h-4 w-4 items-center justify-center rounded-full bg-red-400 text-white" @click="removeItem(item.item_code)">
                                                                                        <Icon name="lucide:minus" size="0.75rem" />
                                                                                </button>
										</div>
										<div>
											{{
												capitalise(
													item.item
												)
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
										N/A
									</div>
								</div>
							</div>
						</div>
                                                <div
									:class="`self-end mt-4 ${expandedPremise == premise.premise_code ? 'px-4 pb-4' : ''}`"
									v-if="
										expandedPremise ==
										premise.premise_code
									"
								>
									<span
										class="text-neutral-700 text-sm mr-2"
										>Total: RM</span
									><span class="text-xl font-medium tabular-nums">{{
										premise.total
									}}</span>
								</div>
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
			.select("item, item_code, unit");
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

const { data: selectedItemsData } = await useAsyncData(
	"selectedItemsData",
	async () => {
		let query = client
			.from("lookup_item")
			.select("*")
			.in("item_code", selectedItems.value);
		const { data } = await query;
		return data;
	},
	{ watch: selectedItems }
);

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
		for (const i of allPremises.value) {
			const premiseName = item_prices.value.find(
				(j) => j.premise_code == i
			)?.premise;
                        const address = item_prices.value.find(
				(j) => j.premise_code == i
			)?.address;
			const obj = [];
			const allItems = item_prices.value.filter(
				(j) => j.premise_code == i
			);
			length = allItems.length;
			let total = 0;
			for (const item of allItems) {
				if (!isNaN(parseFloat(item.price))) {
					total += parseFloat(item.price);
				}
				obj.push({
					item: item.item,
					item_code: item.item_code,
					unit: item.unit,
					price: item.price,
				});
			}
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
                                        address: address,
					premise_code: i,
					items: obj,
					total: total,
				});
			} else {
				data.push({
					length: length,
					premises: [
						{
							premise_name:premiseName,
                                                        address: address,
							premise_code: i,
							items: obj,
							total: total,
						},
					],
				});
			}
		}
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

const shouldntCapitalized = ["nsk", "ttdi", "klcc"];

function capitalise(str) {
	const splitStr = str.toLowerCase().split(" ");
	for (let i = 0; i < splitStr.length; i++) {
		if (
			shouldntCapitalized.findIndex(
				(j) => j == splitStr[i]
			) == -1
		) {
			if (splitStr[i].charAt(0) == '(' || splitStr[i].charAt(0) == ',') {
				splitStr[i] = splitStr[i].charAt(0) + splitStr[i].charAt(1).toUpperCase() +
					splitStr[i].substring(2);
			} else {
				splitStr[i] =
					splitStr[i].charAt(0).toUpperCase() +
					splitStr[i].substring(1);
			}
		} else {
			splitStr[i] = splitStr[i].toUpperCase();
		}
	}
	return splitStr.join(" ");
}

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
