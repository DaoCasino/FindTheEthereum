Name = fte

Domain = stage.dao.casino
DeployPath = /var/www/stage_showcase/stage.dao.casino/games/fte

remove:
	-ssh -o StrictHostKeyChecking=no root@$(Domain) "rm -r $(DeployPath)/*"

deploy: remove
	tar -C ./build -zcvf $(Name).tar .
	scp -o StrictHostKeyChecking=no $(Name).tar root@$(Domain):$(DeployPath)
	ssh -o StrictHostKeyChecking=no root@$(Domain) "tar -xvf $(DeployPath)/$(Name).tar -C $(DeployPath)"
	ssh -o StrictHostKeyChecking=no root@$(Domain) "rm -r $(DeployPath)/$(Name).tar"
	rm -r $(Name).tar
	echo "Successfully deployed. You can check it out on https://$(Domain)/games/fte"

