<script lang="ts">
	import { page } from '$app/stores';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	$: activeUrl = $page.url.pathname;
</script>

<Navbar fluid>
	<NavBrand href="/">
		<img src="/logo.webp" class="ml-5 h-16 sm:h-16" alt="tocq.io logo" />
	</NavBrand>
	<NavHamburger />
	<NavUl {activeUrl} divClass="md:block md:w-auto">
		<NavLi activeClass="text-xl text-fuchsia-600" nonActiveClass="text-xl" href="/">Editor</NavLi>
		<NavLi activeClass="text-xl" nonActiveClass="text-xl">Data Directory</NavLi>
		<NavLi activeClass="text-xl"  nonActiveClass="text-xl">History</NavLi>
	</NavUl>
</Navbar>
