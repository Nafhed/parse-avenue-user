<?php

namespace Grav\Plugin;

use Grav\common\GPM\GPM;
use Grav\Common\Grav;
use Grav\Common\Page\Page;
use Grav\Common\Page\Pages;
use Grav\Common\Plugin;
use Grav\Common\Uri;
use RocketTheme\Toolbox\File\File;
use RocketTheme\Toolbox\Event\Event;
use RocketTheme\Toolbox\Session\Session;
use Symfony\Component\Yaml\Yaml as YamlParser;

class AvenueUser extends Plugin {

	protected $login = 'login';

	/**
	 * @return array
	 */
	public function getSubscribedEvents() {
		return [
			'onPluginsInitialized' => [ 'onPluginsInitialized', 0 ]
		];
	}

	/**
	 * For when the Plugin is activated
	 */
	public function onPluginsInitialized() {

		$this->enable[
			'onTwigSiteVariables' => [ 'onTwigSiteVariables', 0 ],
			'onTwigTemplatePaths' => [ 'onTwigTemplatePaths', 0 ]
		];

	}

	/**
	 * Here we want to load assets from our asset manager
	 * This is where you'll load the front-end frameworks
	 */
	public function onTwigSiteVariables() {
		# check built-in js is enabled within the settings
		if ($this->config->get('plugins.parse-avenue-user.built_in_js')) {

		}

	}

	/**
	 * Define path for plugin templates
	 */
	public function onTwigTemplatePaths() {
		$this->grav['twig']->twig_paths[] = _DIR_ . 'templates';
	}

}