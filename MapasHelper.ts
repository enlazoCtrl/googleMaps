import { ref } from "vue";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import axios from "@/plugins/axios";
import { IDetalleEstacion } from "@/Interfaces/mapas/IDetalleEstacion";
import { ILocalizacion } from "@/Interfaces/mapas/ILocalizaciones";

export const service = ref<google.maps.places.PlacesService>();
export const map = ref<google.maps.Map>();
let infowindow = ref<google.maps.InfoWindow>();
let localizacionesF: google.maps.Marker[] = [];
let geoLocation = ref<ILocalizacion>({ lat: 40.53926, lng: -3.69467 });
let detalleEstacion: IDetalleEstacion[];
let icon: string = "";
let clickedMarker = ref<google.maps.Marker>();
let bounds = ref<google.maps.LatLngBounds>();

export async function initMap(localizaciones: any) {
	navigator.geolocation.getCurrentPosition(
		function (position) {
			geoLocation.value.lat = position.coords.latitude;
			geoLocation.value.lng = position.coords.longitude;
		},
		function (error) {
			if (error.code == error.PERMISSION_DENIED)
				alert(
					"Permiso de geolocalización denegado, esto puede hacer que la app no funcione correctamente."
				);
		}
	);

	const { Map } = (await google.maps.importLibrary(
		"maps"
	)) as google.maps.MapsLibrary;

	const { PlacesService } = (await google.maps.importLibrary(
		"places"
	)) as google.maps.PlacesLibrary;

	map.value = new Map(document.getElementById("googleMap")! as any, {
		center: geoLocation.value,
		zoom: 6,
		zoomControl: false,
		streetViewControl: false,
		mapTypeControl: false,
	});

	bounds.value = new google.maps.LatLngBounds();
	clickedMarker.value = new google.maps.Marker({
		position: { lat: 0, lng: 0 },
		map: map.value,
	});
	service.value = new PlacesService(map.value);
	infowindow.value = new google.maps.InfoWindow();

	for (let index = 0; index < localizaciones.length; index++) {
		let marker = new google.maps.Marker({
			position: {
				lat: localizaciones[index].lat,
				lng: localizaciones[index].lng,
			},
			map: map.value,
			title: `${localizaciones[index].red}`,
			icon: setIcon(localizaciones[index].agrupacion),
		});
		localizacionesF.push(marker);

		google.maps.event.addListener(marker, "click", async function () {
			detalleEstacion = await pedirDetalleEstacion(
				localizaciones[index].prv_codigo
			);
			console.log("detalle estación: ", detalleEstacion[0]);
			infowindow.value?.setContent(setPlantilla(detalleEstacion[0]));
			infowindow.value?.open(map.value, marker);
		});
	}

	eventoMarcadorDeUsuario();
	cerrarEventos();
	new MarkerClusterer({ map: map.value, markers: localizacionesF });
}

function setIcon(agrupacion: string) {
	icon = "/src/assets/map_icon-";
	switch (agrupacion) {
		case "487":
			return (icon += "1.png");
		case "494":
			return (icon += "2.png");
		case "944":
			return (icon += "3.png");
		case "946":
			return (icon += "4.png");
		case "755":
			return (icon += "5.png");
		case "1093":
			return (icon += "6.png");
		default:
			return "no hay icono";
	}
}

function setPlantilla(response: IDetalleEstacion): string {
	const plantilla1: string = `
    <div class="blog-slider">
    <h2>${response.titulo}</h2>
    <div class="column precio">${response.precio}</div>
    <div class="column contenido">
    <table>
    <tr><td>Marca: ${response.marca}</td></tr>
    <tr><td>${response.horario}</td></tr>
    <tr><td>${response.sentido}</td></tr>
    <tr><td>${response.telefono}</td></tr>
    <tr><td>${response.poblacion}</td></tr>
    <tr><td>${response.provincia}</td></tr>
    </table>
    </div>
    <div><h2>footer</h2></div>
    </div>`;
	const plantilla2: string = `
    <div class="blog-slider">
    <h1>Parking</h1>
    </div>`;
	switch (response.agrupacion) {
		case 487:
			return plantilla1;
		case 494:
			return plantilla1;
		case 944:
			return plantilla1;
		case 946:
			return plantilla1;
		case 755:
			return plantilla1;
		case 1093:
			return plantilla2;
		default:
			console.log("evento click derecho: ", event);
			return "no hay plantilla";
	}
}

async function pedirDetalleEstacion(codProveedor: number) {
	console.log(codProveedor);
	const { data } = await axios.get<IDetalleEstacion[]>(
		`${import.meta.env.VITE_APP_BACKEND_NESTJS}${
			import.meta.env.VITE_APP_GENERAL
		}/detalleEstacionServicio?codProveedor=${codProveedor}`
	);
	return data;
}

function cerrarEventos() {
	map.value?.addListener("click", function () {
		if (infowindow) infowindow.value?.close();
		clickedMarker.value?.setPosition({ lat: 1000, lng: 1000 });
	});
}

function eventoMarcadorDeUsuario() {
	map.value?.addListener("rightclick", function (event: any) {
		clickedMarker.value?.setPosition({
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
		});
		infowindow.value?.setContent(`
        <div>
        <h2>Posición clickada</h2>
        <p>lat: ${event.latLng.lat()} lng: ${event.latLng.lng()}</p>
        </div>`);
		infowindow.value?.open(map.value, clickedMarker.value);
	});
}
