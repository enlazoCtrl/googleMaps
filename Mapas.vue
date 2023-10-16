<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import {
		ILocalizaciones,
		ILocalizacion,
	} from "../Interfaces/mapas/Localizaciones";

	const props = defineProps<{
		centrar: ILocalizacion;
		localizaciones?: ILocalizaciones[];
	}>();

	let googleMap = ref<google.maps.Map>();
	let infowindow = ref<google.maps.InfoWindow>();

	onMounted(async () => {
		await initMap();
	});

	async function initMap() {
		const { Map } = (await google.maps.importLibrary(
			"maps"
		)) as google.maps.MapsLibrary;
		googleMap.value = new Map(
			document.getElementById("googleMap") as HTMLElement,
			{
				center: props.centrar,
				zoom: 4,
			}
		);
		infowindow.value = new google.maps.InfoWindow();

		props.localizaciones?.forEach((localizacionF: ILocalizaciones) => {
			const contentString: string = `
	       <div id="bodyContent" class="infoWindowContent">
	       <h1 id="firstHeading" class="firstHeading">${localizacionF.infoWindow.titulo}</h1>
	       <p>${localizacionF.infoWindow.contenido}</p>
	       <a href="http://maps.google.com/?q=${localizacionF.localizacion.lat},${localizacionF.localizacion.lng}" target="_blank"><button class="button" type="button">Visitar</button></a>
           </div>`;

			let marker = new google.maps.Marker({
				position: localizacionF.localizacion,
				map: googleMap.value,
				animation: google.maps.Animation.DROP,
				title: `${localizacionF.infoWindow.titulo}`,
			});

			google.maps.event.addListener(marker, "click", function () {
				infowindow.value?.setContent(contentString);
				infowindow.value?.open(googleMap.value, marker);
			});
		});

		googleMap.value.addListener("click", function () {
			if (infowindow) infowindow.value?.close();
		});
	}
</script>
<template>
	<v-container fluid>
		<v-row justify="center">
			<v-col cols="12" class="pa-0">
				<div id="googleMap" ref="googleMap"></div>
			</v-col>
		</v-row>
	</v-container>
</template>
<style scope>
	#googleMap {
		border-radius: 5px;
		height: 500px;
		width: inherit;
	}
	.button {
		background-color: bisque;
		border: none;
		padding: 5px 10px;
		text-align: center;
		display: inline-block;
		font-size: 14px;
		margin: 4px 2px;
		cursor: pointer;
		border-radius: 4px;
	}
	.infoWindowContent {
		text-align: center;
	}
</style>
